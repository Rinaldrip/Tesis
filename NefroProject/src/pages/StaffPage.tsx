import { useState, useEffect } from "react";
import TarjetaEspecialista from '../components/custom/especialista/tarjetaEspecialista';
import ModalEspecialista from "@/components/custom/especialista/formEspecialista";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { api } from "@/services/paciente.api";

// Interface para el especialista
interface Especialista {
    cedula: string;
    full_name: string;
    date_of_birth: string;
    specialty: string;
    graduation_year: string;
    university: string;
    email: string;
    phone: string;
    num_colegio: string;
    num_mpps: string;
    direction: string;
    created_at?: string;
    updated_at?: string;
}

// Función para mapear datos del formulario a la base de datos
const mapFormToDB = (formData: any) => ({
    cedula: formData.cedula,
    full_name: formData.fullName,
    date_of_birth: formData.dateOfBirth,
    specialty: formData.specialty,
    graduation_year: formData.graduationYear,
    university: formData.university,
    email: formData.email,
    phone: formData.phone,
    num_colegio: formData.NumColegio,
    num_mpps: formData.NumMpps,
    direction: formData.direction
});

// Función para mapear datos de la base de datos al formulario
const mapDBToForm = (dbData: Especialista) => ({
    cedula: dbData.cedula,
    fullName: dbData.full_name,
    dateOfBirth: dbData.date_of_birth,
    specialty: dbData.specialty,
    graduationYear: dbData.graduation_year,
    university: dbData.university,
    email: dbData.email,
    phone: dbData.phone,
    NumColegio: dbData.num_colegio,
    NumMpps: dbData.num_mpps,
    direction: dbData.direction
});

function StaffPage() {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [selectMode, setSelectMode] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [staffData, setStaffData] = useState<Especialista[]>([]);
    const [editingEspecialista, setEditingEspecialista] = useState<Especialista | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEspecialistas();
    }, []);

    const fetchEspecialistas = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/especialistas');

            if (response.data.success) {
                setStaffData(response.data.data);
            } else {
                throw new Error(response.data.error || 'Error desconocido');
            }
        } catch (error: any) {
            console.error('Error fetching especialistas:', error);

            let errorMessage = 'Error de conexión';

            if (error.response) {
                // El servidor respondió con un código de error
                errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                // La petición fue hecha pero no se recibió respuesta
                errorMessage = 'No se pudo conectar al servidor. Verifica que esté ejecutándose en el puerto 4000.';
            } else {
                // Algo pasó en la configuración de la petición
                errorMessage = error.message || 'Error de configuración';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEspecialista = async (formData: any) => {
        try {
            const dbData = mapFormToDB(formData);

            const response = await api.post('/especialista/add', dbData);

            if (response.data.success) {
                setOpenModal(false);
                await fetchEspecialistas();
            }
        } catch (error: any) {
            console.error('Error adding especialista:', error);
            const errorMessage = error.response?.data?.error || 'Error al agregar especialista';
        }
    };

    const handleEditEspecialista = async (formData: any) => {
        if (!editingEspecialista) return;

        try {
            const dbData = mapFormToDB(formData);

            const response = await api.put(`/especialista/update/${editingEspecialista.cedula}`, dbData);

            if (response.data.success) {
                setOpenModal(false);
                setEditingEspecialista(null);
                setSelectedIndex(null);
                await fetchEspecialistas();
            }
        } catch (error: any) {
            console.error('Error updating especialista:', error);
            const errorMessage = error.response?.data?.error || 'Error al actualizar especialista';
        }
    };

    const handleDelete = async () => {
        if (selectedIndex === null) return;

        const especialista = staffData[selectedIndex];

        if (!confirm(`¿Está seguro de que desea eliminar al especialista ${especialista.full_name}?`)) {
            return;
        }

        try {
            const response = await api.delete(`/especialista/delete/${especialista.cedula}`);

            if (response.data.success) {
                setSelectedIndex(null);
                await fetchEspecialistas();
            }
        } catch (error: any) {
            console.error('Error deleting especialista:', error);
            const errorMessage = error.response?.data?.error || 'Error al eliminar especialista';
        }
    };

    const handleEdit = () => {
        if (selectedIndex !== null) {
            const especialista = staffData[selectedIndex];
            setEditingEspecialista(especialista);
            setOpenModal(true);
        }
    };

    const handleOpenModal = () => {
        setEditingEspecialista(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingEspecialista(null);
    };

    const getInitialData = () => {
        if (editingEspecialista) {
            return mapDBToForm(editingEspecialista);
        }
        return undefined;
    };

    return (
        <div className="my-5">
            <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
                Panel del Personal Médico
            </h1>
            <p className="text-gray-600 mb-10 text-center">
                Visualiza y gestiona los especialistas registrados en el servicio de nefrología.
            </p>
            {/* HEADER BUTTONS */}
            <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4'>
                <Button
                    className="h-12 bg-blue-900 text-white hover:bg-blue-800"
                    onClick={handleOpenModal}
                    disabled={loading}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Especialista
                </Button>


                <Button
                    className={`h-12 ${selectMode ? "bg-amber-600 hover:bg-amber-500" : "bg-gray-700 hover:bg-gray-600"} text-white`}
                    onClick={() => {
                        setSelectMode(!selectMode);
                        if (!selectMode) setSelectedIndex(null);
                    }}
                    disabled={loading || staffData.length === 0}
                >
                    {selectMode ? (
                        <>
                            <Check className="h-4 w-4 mr-2" /> Finalizar selección
                        </>
                    ) : (
                        "Seleccionar tarjeta"
                    )}
                </Button>

                {selectedIndex !== null && (
                    <div className="flex gap-4">
                        <Button
                            className="h-12 bg-green-700 text-white hover:bg-green-600"
                            onClick={handleEdit}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                        <Button
                            className="h-12 bg-red-700 text-white hover:bg-red-600"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                    </div>
                )}
            </div>

            {/* MENSAJE DE ERROR */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error de conexión</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <div className="mt-2">
                                <p className="text-sm text-red-600">
                                    <strong>Para solucionar:</strong>
                                </p>
                                <ul className="text-sm text-red-600 list-disc list-inside mt-1">
                                    <li>Asegúrate de que el servidor esté ejecutándose en el puerto 4000</li>
                                    <li>Verifica que la variable VITE_API_URL esté configurada correctamente</li>
                                    <li>Revisa que no haya errores en la consola del servidor</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando especialistas...</p>
                </div>
            )}

            {!loading && staffData.length === 0 && !error && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No hay especialistas registrados</p>
                    <p className="text-gray-400 mt-2">Haz clic en "Añadir Especialista" para comenzar</p>
                </div>
            )}

            {!loading && staffData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {staffData.map((especialista, index) => {
                        const isSelected = index === selectedIndex;
                        const tarjetaData = mapDBToForm(especialista);

                        return (
                            <div
                                key={especialista.cedula}
                                onClick={() => selectMode && setSelectedIndex(index)}
                                className={`
                                    transition-all rounded-2xl
                                    ${selectMode ? "cursor-pointer" : ""}
                                    ${isSelected ? "ring-4 ring-amber-500" : "ring-0"}
                                    ${selectMode && !isSelected ? "hover:ring-2 hover:ring-gray-400" : ""}
                                `}
                            >
                                <TarjetaEspecialista data={tarjetaData} />
                            </div>
                        );
                    })}
                </div>
            )}

            <ModalEspecialista
                open={openModal}
                onClose={handleCloseModal}
                onSubmit={editingEspecialista ? handleEditEspecialista : handleAddEspecialista}
                initialData={getInitialData()}
            />
        </div>
    );
}

export default StaffPage;