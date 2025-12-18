// pages/PatientsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PacientCart } from "@/components/custom/paciente/PacientCart";
import { SearchCustom } from "@/components/custom/SearchCustom";
import { Pagination } from "@/components/custom/Pagination";
import { Loader, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "@/services/paciente.api";

interface Patient {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    enfermedad: string;
    estado: string | 'Estable' | 'Critico' | 'Mejorando' | 'Activo' | 'Inactivo';
    ultimaVisita: string;
    creatina: string;
    proteinasT: string;
}

type SortOption = "nombre" | "cedula" | "estado" | "fecha-ingreso";
type SortDirection = "asc" | "desc";

export const PatientsPage = () => {
    const navigate = useNavigate();

    // 🔹 Estado principal
    const [allPatients, setAllPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 🔹 Búsqueda / ordenamiento
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ field: SortOption; direction: SortDirection }>({
        field: "nombre",
        direction: "asc",
    });

    // 🔹 🔵 PAGINACIÓN LOCAL BASE 0
    const [currentPage, setCurrentPage] = useState(0); // 👈 BASE 0 REAL
    const itemsPerPage = 8;

    // Handlers
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const handleSort = (field: SortOption, direction: SortDirection) => {
        setSortConfig({ field, direction });
        setCurrentPage(0);
    };

    const handleAddPatient = () => navigate("/pacientes/add");

    // 🔹 Obtener todos los pacientes solo una vez
    const fetchPatients = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/pacientes`);
            const { data } = response.data;
            setAllPatients(data);
        } catch (err: any) {
            console.error("❌ Error fetching patients:", err);
            setError(err.response?.data?.error || "Error al cargar pacientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // 🔹 Filtrado instantáneo
    const filtered = allPatients.filter((p) => {
        if (!searchTerm.trim()) return true;
        const t = searchTerm.toLowerCase();
        return (
            p.nombre.toLowerCase().includes(t) ||
            p.apellido.toLowerCase().includes(t) ||
            p.cedula.includes(t) ||
            p.enfermedad?.toLowerCase().includes(t) ||
            p.estado?.toLowerCase().includes(t)
        );
    });

    // 🔹 Ordenamiento
    const sorted = [...filtered].sort((a, b) => {
        let aVal: any = "";
        let bVal: any = "";

        switch (sortConfig.field) {
            case "nombre":
                aVal = a.nombre.toLowerCase();
                bVal = b.nombre.toLowerCase();
                break;
            case "cedula":
                aVal = a.cedula;
                bVal = b.cedula;
                break;
            case "estado":
                aVal = a.estado?.toLowerCase();
                bVal = b.estado?.toLowerCase();
                break;
            case "fecha-ingreso":
                aVal = new Date(a.ultimaVisita).getTime();
                bVal = new Date(b.ultimaVisita).getTime();
                break;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    // 🔹 Paginación BASE 0 correcta
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const indexOfFirst = currentPage * itemsPerPage; // 👈 BASE 0
    const indexOfLast = indexOfFirst + itemsPerPage;
    const currentPatients = sorted.slice(indexOfFirst, indexOfLast);

    // 🔹 Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando pacientes...</p>
                </div>
            </div>
        );
    }

    // 🔹 Error crítico
    if (error && allPatients.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <div className="text-red-600 text-4xl mb-2">⚠️</div>
                        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => fetchPatients()}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* HEADER */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h1>
                <p className="text-gray-600">
                    {totalItems} paciente{totalItems !== 1 ? "s" : ""} encontrado
                    {totalItems !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Warning */}
            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-yellow-800 text-sm">{error}</p>
                </div>
            )}

            {/* Search */}
            <SearchCustom
                onSearch={handleSearch}
                onSort={handleSort}
                onAddPatient={handleAddPatient}
                searchTerm={searchTerm}
                currentSort={sortConfig}
            />

            {searchTerm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                        {sorted.length} resultado{sorted.length !== 1 ? "s" : ""} para "{searchTerm}"
                    </p>
                </div>
            )}

            {/* Top Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage} // 👈 BASE 0 REAL
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentPatients.map((patient) => (
                    <PacientCart key={patient.cedula || patient.id} patient={patient} />
                ))}
            </div>

            {/* Bottom Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* No results */}
            {sorted.length === 0 && (
                <div className="text-center py-12">
                    {searchTerm ? (
                        <>
                            <p className="text-gray-500 text-lg mb-2">No se encontraron pacientes</p>
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mostrar todos los pacientes
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-500 text-lg mb-4">No hay pacientes registrados</p>
                            <button
                                onClick={handleAddPatient}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                            >
                                Agregar Primer Paciente
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
