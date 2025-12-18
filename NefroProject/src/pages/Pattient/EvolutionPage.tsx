import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from "@/services/paciente.api";
import UrineTestsTable from './Tables/UrineTable';
import MedicalOrdersTable from './Tables/MedicalOrderTable';
import BloodTestsTable from './Tables/BloodTable';
import EvolucionTable from './Tables/EvolucionTable';
import TratamientoTable from './Tables/TratamientoTable';
import PatientHeader from '@/components/custom/paciente/HeaderInfo';
import BackToPatientButton from '@/components/custom/BackToPatientButton';

// Interfaces para los datos del backend
export interface UrineTest {
    id: string;
    fecha: string;
    ph: string;
    proteinas: string;
    hemoglobina: boolean;
    glucosa: string;
    leuco: string;
    hematies: string;
    celulas: string;
    bacterias: boolean;
}

export interface MedicalOrder {
    id: string;
    fecha: string;
    orden: string;
}

export interface BloodTest {
    id: string;
    fecha: string;
    hb: string;
    hto: string;
    gb: string;
    neut: string;
    linf: string;
    eos: string;
    plt: string;
    glicemia: string;
    urea: string;
    creatinina: string;
    proteinas_t: string;
    albumina: string;
    globulinas: string;
    colesterol: string;
    trigliceridos: string;
    ac_urico: string;
    tgo: string;
    tgp: string;
    bt: string;
    bd: string;
    bi: string;
    na: string;
    k: string;
    cl: string;
    ca: string;
    p: string;
    mg: string;
    pt: string;
    ptt: string;
}

export interface PatientEvolution {
    id: string;
    fecha: string;
    evolucion: string;
}

export interface Tratamiento {
    id: string;
    fecha: string;
    tratamiento: string;
}

interface PatientData {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    fecha_nacimiento: string;
    estado: string;
    fecha_ingreso: string;
    tipo: string;
    fecha_realizada: string;
    tipo_dialisis: string;
    etiologia_enfermedad_renal: string;
    hipertension_arterial: boolean;
}

function PatientPage() {
    const { cedula } = useParams<{ cedula: string }>();

    const [urineTests, setUrineTests] = useState<UrineTest[]>([]);
    const [patient, setPatient] = useState<PatientData | null>(null);
    const [medicalOrders, setMedicalOrders] = useState<MedicalOrder[]>([]);
    const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
    const [evoluciones, setEvoluciones] = useState<PatientEvolution[]>([]);
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);

    const [loading, setLoading] = useState({
        urineTests: false,
        medicalOrders: false,
        bloodTests: false,
        evoluciones: false,
        tratamientos: false,
        patient: true,
    });
    const [, setError] = useState<string | null>(null);
    const [tableErrors, setTableErrors] = useState<Record<string, string>>({});

    // CORRECCIÓN: Usar el endpoint correcto para PatientData
    const fetchPatientData = async () => {
        if (!cedula) return;
        try {
            setLoading(prev => ({ ...prev, patient: true }));
            setError(null);

            // Usar el endpoint que creamos para PatientData
            const response = await api.get(`/pacientes/header/${cedula}`);

            // Verificar la estructura de la respuesta
            if (response.data.success && response.data.patientData) {
                setPatient(response.data.patientData);
            } else {
                setError("Estructura de datos incorrecta del servidor");
            }
        } catch (error: any) {
            console.error("❌ Error cargando datos del paciente:", error);
            if (error.response) {
                console.error("❌ Respuesta de error:", error.response.data);
                setError(`Error ${error.response.status}: ${error.response.data?.error || 'Error del servidor'}`);
            } else {
                setError("No se pudo conectar con el servidor");
            }
        } finally {
            setLoading(prev => ({ ...prev, patient: false }));
        }
    };

    // Función genérica para cargar datos de cada tabla
    const fetchTableData = async <T,>(
        endpoint: string,
        tableName: keyof typeof loading,
        setData: (data: T[]) => void
    ) => {
        if (!cedula) return;

        try {
            setLoading(prev => ({ ...prev, [tableName]: true }));
            setTableErrors(prev => ({ ...prev, [tableName]: '' }));

            const response = await api.get(`${endpoint}/${cedula}`);

            // Manejar diferentes estructuras de respuesta
            const data = response.data[tableName] ||
                response.data.examenesOrina ||
                response.data.ordenes_medicas ||
                response.data.laboratorios ||
                response.data.evoluciones ||
                response.data.tratamientos ||
                response.data;

            setData(Array.isArray(data) ? data : []);

        } catch (error: any) {
            console.error(`❌ Error cargando ${tableName}:`, error);

            let errorMessage = `Error al cargar ${tableName}`;

            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                errorMessage = error.message || `Error desconocido en ${tableName}`;
            }

            setTableErrors(prev => ({ ...prev, [tableName]: errorMessage }));
            setData([]);

        } finally {
            setLoading(prev => ({ ...prev, [tableName]: false }));
        }
    };

    // Funciones específicas para cada tabla
    const fetchUrineTests = () =>
        fetchTableData<UrineTest>('/pacientes/test-orina', 'urineTests', setUrineTests);

    const fetchMedicalOrders = () =>
        fetchTableData<MedicalOrder>('/pacientes/ordenes-medicas', 'medicalOrders', setMedicalOrders);

    const fetchBloodTests = () =>
        fetchTableData<BloodTest>('/pacientes/laboratorios', 'bloodTests', setBloodTests);

    const fetchEvoluciones = () =>
        fetchTableData<PatientEvolution>('/pacientes/evoluciones', 'evoluciones', setEvoluciones);

    const fetchTratamientos = () =>
        fetchTableData<Tratamiento>('/pacientes/tratamientos', 'tratamientos', setTratamientos);

    // Cargar datos iniciales
    useEffect(() => {
        if (cedula) {
            fetchPatientData();
            fetchUrineTests();
            fetchMedicalOrders();
            fetchBloodTests();
            fetchEvoluciones();
            fetchTratamientos();
        }
    }, [cedula]);

    // Función auxiliar para manejar errores de API
    const handleApiError = (error: any, defaultMessage: string) => {
        console.error('API Error:', error);

        if (error.response) {
            throw new Error(error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`);
        } else if (error.request) {
            throw new Error('No se pudo conectar con el servidor');
        } else {
            throw new Error(error.message || defaultMessage);
        }
    };

    // Funciones para agregar datos (actualizadas para recargar solo la tabla correspondiente)
    const handleAddUrineTest = async (test: Omit<UrineTest, 'id'>) => {
        if (!cedula) return;
        try {
            await api.post('/pacientes/test-orina', {
                paciente: { cedula: cedula },
                ...test
            });
            await fetchUrineTests(); // Recargar solo tests de orina
        } catch (error: any) {
            console.error('Error al agregar test de orina:', error);
            handleApiError(error, 'Error al agregar test de orina');
        }
    };

    const handleAddMedicalOrder = async (order: Omit<MedicalOrder, 'id'>) => {
        if (!cedula) return;
        try {
            await api.post('/pacientes/ordenes-medicas', {
                paciente: { cedula: cedula },
                ...order
            });
            await fetchMedicalOrders(); // Recargar solo órdenes médicas
        } catch (error: any) {
            console.error('Error al agregar orden médica:', error);
            handleApiError(error, 'Error al agregar orden médica');
        }
    };

    const handleAddBloodTest = async (test: Omit<BloodTest, 'id'>) => {
        if (!cedula) return;
        try {
            await api.post('/pacientes/laboratorios', {
                paciente: { cedula: cedula },
                ...test
            });
            await fetchBloodTests(); // Recargar solo tests de sangre
        } catch (error: any) {
            console.error('Error al agregar test de sangre:', error);
            handleApiError(error, 'Error al agregar examen de sangre');
        }
    };

    const handleAddEvolution = async (evolution: Omit<PatientEvolution, 'id'>) => {
        if (!cedula) return;
        try {
            await api.post('/pacientes/evoluciones', {
                paciente: { cedula: cedula },
                ...evolution
            });
            await fetchEvoluciones(); // Recargar solo evoluciones
        } catch (error: any) {
            console.error('Error al agregar evolución:', error);
            handleApiError(error, 'Error al agregar evolución');
        }
    };

    const handleAddTratamiento = async (tratamiento: Omit<Tratamiento, 'id'>) => {
        if (!cedula) return;
        try {
            await api.post('/pacientes/tratamientos', {
                paciente: { cedula: cedula },
                ...tratamiento
            });
            await fetchTratamientos(); // Recargar solo tratamientos
        } catch (error: any) {
            console.error('Error al agregar tratamiento:', error);
            handleApiError(error, 'Error al agregar tratamiento');
        }
    };

    // Funciones para eliminar datos (actualizadas para recargar solo la tabla correspondiente)
    const handleDeleteUrineTest = async (id: string) => {
        try {
            await api.delete(`/pacientes/test-orina/eliminate/${id}`);
            await fetchUrineTests(); // Recargar solo tests de orina
        } catch (error: any) {
            console.error('Error al eliminar test de orina:', error);
            handleApiError(error, 'Error al eliminar test de orina');
        }
    };

    const handleDeleteMedicalOrder = async (id: string) => {
        try {
            await api.delete(`/pacientes/ordenes-medicas/eliminate/${id}`);
            await fetchMedicalOrders(); // Recargar solo órdenes médicas
        } catch (error: any) {
            console.error('Error al eliminar orden médica:', error);
            handleApiError(error, 'Error al eliminar orden médica');
        }
    };

    const handleDeleteBloodTest = async (id: string) => {
        try {
            await api.delete(`/pacientes/laboratorios/eliminate/${id}`);
            await fetchBloodTests(); // Recargar solo tests de sangre
        } catch (error: any) {
            handleApiError(error, 'Error al eliminar examen de sangre');
        }
    };

    const handleDeleteEvolution = async (id: string) => {
        try {
            await api.delete(`/pacientes/evoluciones/eliminate/${id}`);
            await fetchEvoluciones(); // Recargar solo evoluciones
        } catch (error: any) {
            handleApiError(error, 'Error al eliminar evolución');
        }
    };

    const handleDeleteTratamiento = async (id: string) => {
        try {
            await api.delete(`/pacientes/tratamientos/eliminate/${id}`);
            await fetchTratamientos(); // Recargar solo tratamientos
        } catch (error: any) {
            handleApiError(error, 'Error al eliminar tratamiento');
        }
    };

    // Mostrar loading si no hay patientId
    if (!cedula) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Paciente no encontrado</h1>
                    <p className="text-gray-600">No se pudo identificar el paciente</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <BackToPatientButton />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-13">
                {/* Header con información del paciente */}
                {patient && <PatientHeader patientData={patient} />}


                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* Evolución del Paciente */}
                        <EvolucionTable
                            data={evoluciones}
                            loading={loading.evoluciones}
                            error={tableErrors.evoluciones}
                            onAddItem={handleAddEvolution}
                            onDeleteItem={handleDeleteEvolution}
                            refetch={fetchEvoluciones} // Pasar función específica
                        />

                        {/* Órdenes Médicas */}
                        <MedicalOrdersTable
                            data={medicalOrders}
                            loading={loading.medicalOrders}
                            error={tableErrors.medicalOrders}
                            onAddItem={handleAddMedicalOrder}
                            onDeleteItem={handleDeleteMedicalOrder}
                            refetch={fetchMedicalOrders} // Pasar función específica
                        />

                        {/* Tratamiento Médico */}
                        <TratamientoTable
                            data={tratamientos}
                            loading={loading.tratamientos}
                            error={tableErrors.tratamientos}
                            onAddItem={handleAddTratamiento}
                            onDeleteItem={handleDeleteTratamiento}
                            refetch={fetchTratamientos} // Pasar función específica
                        />

                        {/* Test de Orina */}
                        <UrineTestsTable
                            data={urineTests}
                            loading={loading.urineTests}
                            error={tableErrors.urineTests}
                            onAddItem={handleAddUrineTest}
                            onDeleteItem={handleDeleteUrineTest}
                            refetch={fetchUrineTests} // Pasar función específica
                        />

                        {/* Test de Sangre */}
                        <BloodTestsTable
                            data={bloodTests}
                            loading={loading.bloodTests}
                            error={tableErrors.bloodTests}
                            onAddItem={handleAddBloodTest}
                            onDeleteItem={handleDeleteBloodTest}
                            refetch={fetchBloodTests} // Pasar función específica
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientPage;