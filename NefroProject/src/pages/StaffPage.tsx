import { useState, useEffect } from "react";
import TarjetaEspecialista from '../components/custom/especialista/tarjetaEspecialista';
import ModalEspecialista from "@/components/custom/especialista/formEspecialista";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Check, Stethoscope } from "lucide-react";
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
    is_active: boolean;
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
    direction: formData.direction,
    is_active: formData.isActive || false
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
    direction: dbData.direction,
    isActive: dbData.is_active
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
            setError(errorMessage);
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
            setError(errorMessage);
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
            setError(errorMessage);
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

    const handleSetActive = async () => {
        if (selectedIndex === null) return;
        const especialista = staffData[selectedIndex];

        try {
            setLoading(true);
            // Llamada al nuevo endpoint
            const response = await api.put(`/especialista/set-active/${especialista.cedula}`);

            if (response.data.success) {
                // Recargamos la lista para ver el cambio reflejado visualmente
                await fetchEspecialistas();
                setSelectedIndex(null); // Opcional: limpiar selección
                setSelectMode(false);   // Opcional: salir del modo selección
            }
        } catch (error: any) {
            console.error('Error setting active doctor:', error);
            setError("No se pudo actualizar el médico en servicio");
        } finally {
            setLoading(false);
        }
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

    // ✅ CORRECCIÓN 1: Función segura para cambiar el modo
    const toggleSelectMode = () => {
        if (selectMode) {
            // Si estaba activo y lo vamos a desactivar, limpiamos la selección y apagamos el modo
            setSelectedIndex(null);
            setSelectMode(false);
        } else {
            // Si estaba inactivo, solo lo encendemos
            setSelectMode(true);
        }
    };

    // ✅ CORRECCIÓN 2: Función para seleccionar/deseleccionar tarjeta
    const handleCardClick = (index: number) => {
        if (!selectMode) return; // Si no está en modo selección, no hace nada

        if (selectedIndex === index) {
            // Si toco la misma tarjeta que ya tenía, la deselecciono
            setSelectedIndex(null);
        } else {
            // Selecciono la nueva
            setSelectedIndex(index);
        }
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
                {/* Botón Añadir (Igual) */}
                <Button
                    className="h-12 bg-blue-900 text-white hover:bg-blue-800"
                    onClick={handleOpenModal}
                    disabled={loading}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Especialista
                </Button>

                {/* ✅ CORRECCIÓN 3: Usar la nueva función toggleSelectMode */}
                <Button
                    className={`h-12 ${selectMode ? "bg-amber-600 hover:bg-amber-500" : "bg-gray-700 hover:bg-gray-600"} text-white`}
                    onClick={toggleSelectMode}
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

                {/* Botones de Editar/Eliminar (Igual) */}
                {selectedIndex !== null && (
                    <div className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* 4. Nuevo Botón: Médico en Servicio */}
                        <Button
                            className="h-12 bg-indigo-600 text-white hover:bg-indigo-500"
                            onClick={handleSetActive}
                        >
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Médico en Servicio
                        </Button>

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
                        const isActiveDoctor = especialista.is_active;

                        return (
                            <div
                                key={especialista.cedula}
                                onClick={() => handleCardClick(index)}
                                className={`
                                    transition-all duration-200 rounded-2xl relative
                                    ${selectMode ? "cursor-pointer hover:scale-[1.02]" : ""}
                                    ${isSelected ? "ring-4 ring-amber-500 shadow-lg scale-[1.02]" : "ring-0"}
                                    ${/* Estilo especial para el médico activo */ isActiveDoctor && !isSelected ? "ring-2 ring-indigo-500 bg-indigo-50/30" : ""}
                                `}
                            >
                                {/* Badge/Etiqueta visual para saber quién es el activo */}
                                {isActiveDoctor && (
                                    <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1">
                                        <Stethoscope size={12} /> En Servicio
                                    </div>
                                )}

                                {selectMode && (
                                    <div className="absolute inset-0 z-10 rounded-2xl" />
                                )}
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