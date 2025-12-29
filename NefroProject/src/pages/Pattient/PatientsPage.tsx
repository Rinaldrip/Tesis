import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PacientCart } from "@/components/custom/paciente/PacientCart";
import { SearchCustom } from "@/components/custom/SearchCustom";
import { Pagination } from "@/components/custom/Pagination";
import { Loader, RefreshCw, AlertCircle, Filter } from "lucide-react";
import { api } from "@/services/paciente.api";

// Interfaces
interface Patient {
    cedula: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    enfermedad: string;
    tipo_dialisis: string;
    acceso_vascular: string;
    hipertension_arterial: boolean;
    estado: string;
    ultimaVisita: string;
    creatinina: number;
    proteinasT: number;
    edad: number;
}

type SortOption = "nombre" | "cedula" | "estado" | "fecha-ingreso";
type SortDirection = "asc" | "desc";

export const PatientsPage = () => {
    const navigate = useNavigate();

    // Estados
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ field: SortOption; direction: SortDirection }>({
        field: "fecha-ingreso",
        direction: "desc",
    });

    // Filtros
    const [filters, setFilters] = useState({
        estado: "",
        dialisis: "",
        hipertension: "",
        acceso_vascular: ""
    });

    // Paginación
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 0
    });

    const activeFiltersCount = Object.values(filters).filter(v => v !== "").length;

    // 1. Fetch de Pacientes
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Construimos los parámetros URL
            const params = new URLSearchParams({
                page: pagination.page.toString(),     // Enviamos página al backend
                limit: pagination.limit.toString(),   // Enviamos límite al backend
                sortBy: sortConfig.field,             // Enviamos ordenamiento
                sortOrder: sortConfig.direction,
                ...(searchTerm && { search: searchTerm }),
                ...(filters.estado && { estado: filters.estado }),
                ...(filters.dialisis && { dialisis: filters.dialisis }),
                ...(filters.hipertension && { hipertension: filters.hipertension }),
                ...(filters.acceso_vascular && { acceso_vascular: filters.acceso_vascular })
            });

            console.log("📡 Consultando:", `/pacientes?${params.toString()}`); // Log para verificar

            const response = await api.get(`/pacientes?${params.toString()}`);

            if (response.data.success) {
                // CORRECCIÓN IMPORTANTE:
                // No usamos .slice() aquí porque el backend ya nos da los datos paginados.
                // Usamos response.data.data directamente.
                setPatients(response.data.data || []);

                // Actualizamos la información de paginación que viene del backend
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.pagination.total,
                        totalPages: response.data.pagination.totalPages
                    }));
                }
            } else {
                throw new Error("La respuesta del servidor no fue exitosa");
            }

        } catch (err: any) {
            console.error("❌ Error fetching patients:", err);
            setError(err.response?.data?.error || "Error al cargar pacientes");
            setPatients([]);
        } finally {
            setLoading(false); // Esto asegura que el spinner desaparezca
        }
    }, [searchTerm, filters, pagination.page, pagination.limit, sortConfig]);

    // 2. CORRECCIÓN: El useEffect que faltaba para disparar la carga
    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);


    // Handlers
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1 al buscar
    };

    const handleSort = (field: SortOption, direction: SortDirection) => {
        setSortConfig({ field, direction });
        // No reseteamos página necesariamente, pero refrescamos la consulta automáticamente por el useEffect
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1 al filtrar
    };

    const handleAddPatient = () => navigate("/pacientes/add");

    const handlePageChange = (newPage: number) => {
        // La paginación visual suele ser 0-indexed, pero tu estado es 1-indexed
        setPagination(prev => ({ ...prev, page: newPage + 1 }));
    };

    const handleClearFilters = () => {
        setFilters({ estado: "", dialisis: "", hipertension: "", acceso_vascular: "" });
        setSearchTerm("");
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Render de Carga
    if (loading && patients.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando pacientes...</p>
                </div>
            </div>
        );
    }

    // Render de Error
    if (error && patients.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de conexión</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchPatients}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium mx-auto transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="text-center py-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Pacientes</h1>
                <p className="text-gray-600">
                    Mostrando {patients.length} de {pagination.total} pacientes registrados
                </p>
            </div>

            {/* Componente de Búsqueda y Filtros */}
            <SearchCustom
                onSearch={handleSearch}
                onSort={handleSort}
                onAddPatient={handleAddPatient}
                onFilterChange={handleFilterChange}
                searchTerm={searchTerm}
                currentSort={sortConfig}
                onClear={handleClearFilters}
            />

            {/* Grid de Pacientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {patients.map((patient) => (
                    <PacientCart
                        key={patient.cedula}
                        patient={{
                            id: parseInt(patient.cedula) || 0,
                            cedula: patient.cedula,
                            nombre: patient.nombre,
                            apellido: patient.apellido,
                            fechaNacimiento: patient.fechaNacimiento,
                            enfermedad: patient.enfermedad,
                            estado: patient.estado as any,
                            ultimaVisita: patient.ultimaVisita,
                            creatinina: patient.creatinina?.toString() || "N/A",
                            proteinasT: patient.proteinasT?.toString() || "N/A"
                        }}
                    />
                ))}
            </div>

            {/* Estado Vacío */}
            {patients.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="text-gray-300 mb-4 text-6xl">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No se encontraron resultados
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Intenta ajustar tus filtros de búsqueda o agrega un nuevo paciente al sistema.
                    </p>
                    <button
                        onClick={handleClearFilters}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Limpiar búsqueda
                    </button>
                </div>
            )}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
                <div className="py-4 flex justify-center">
                    <Pagination
                        currentPage={pagination.page - 1} // Ajuste porque tu componente Pagination parece ser 0-indexed
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};