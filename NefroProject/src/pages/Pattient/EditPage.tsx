import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientEditForm } from '../../components/custom/paciente/EditPattientForm';
import { Loader } from 'lucide-react';
import { api } from '@/services/paciente.api';
import type { PatientData } from '@/types/patientInterface';
import BackToPatientButton from '@/components/custom/BackToPatientButton';

function EditPage() {
    const { cedula } = useParams<{ cedula: string }>();
    const navigate = useNavigate();

    const [patientData, setPatientData] = useState<PatientData | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para extraer el primer elemento de un array
    const extractFirst = (arr: any, defaultObj: any) => {
        return (Array.isArray(arr) && arr.length > 0) ? arr[0] : defaultObj;
    };

    // useEffect para cargar los datos del paciente
    useEffect(() => {
        const fetchPatient = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Obtener datos crudos
                const response = await api.get(`/pacientes/${cedula}`);

                // Asegurarnos de dónde vienen los datos
                const rawData = response.data.success ? response.data : (response.data.data || response.data);

                // Transformar los datos al formato PatientData
                const cleanData: PatientData = {
                    paciente: {
                        ...rawData.paciente,
                        fecha_nacimiento: rawData.paciente?.fecha_nacimiento
                            ? String(rawData.paciente.fecha_nacimiento).split('T')[0]
                            : '',
                    },
                    datosIngreso: {
                        ...rawData.datosIngreso,
                        fecha_ingreso: rawData.datosIngreso?.fecha_ingreso
                            ? String(rawData.datosIngreso.fecha_ingreso).split('T')[0]
                            : '',
                        fecha_egreso: rawData.datosIngreso?.fecha_egreso
                            ? String(rawData.datosIngreso.fecha_egreso).split('T')[0]
                            : '',
                    },
                    datosMedicos: rawData.datosMedicos || {},
                    contactosEmergencia: extractFirst(rawData.contactosEmergencia, {
                        nombre: '',
                        telefono: '',
                        parentesco: ''
                    }),
                    accesosVasculares: rawData.accesosVasculares && Array.isArray(rawData.accesosVasculares)
                        ? rawData.accesosVasculares.map((acc: any) => ({
                            ...acc,
                            fecha_realizada: acc.fecha_realizada
                                ? String(acc.fecha_realizada).split('T')[0]
                                : ''
                        }))
                        : [],
                    ultimoTratamiento: rawData.ultimoTratamiento ? {
                        tratamiento: rawData.ultimoTratamiento.tratamiento
                    } : { tratamiento: '' }
                };

                setPatientData(cleanData);

            } catch (err: any) {
                console.error("Error fetching patient:", err);
                const errorMsg = typeof err.response?.data?.error === 'string'
                    ? err.response.data.error
                    : "Error inesperado al cargar datos";
                setError(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        if (cedula) {
            fetchPatient();
        } else {
            setError('Cédula no proporcionada');
            setLoading(false);
        }
    }, [cedula]);

    // Función para manejar la actualización del paciente
    const handleUpdate = async (formData: PatientData) => {
        try {
            console.log("📤 Datos recibidos del formulario:", JSON.stringify(formData, null, 2));

            // Extraer el primer elemento del array si es necesario
            const contactoEmergencia = Array.isArray(formData.contactosEmergencia)
                ? formData.contactosEmergencia[0]
                : formData.contactosEmergencia;

            const accesoVascular = Array.isArray(formData.accesosVasculares) && formData.accesosVasculares.length > 0
                ? formData.accesosVasculares[0]
                : { tipo: '', fecha_realizada: '', ubicacion: '' };

            // Preparar datos en la estructura EXACTA que espera el backend
            const dataToSend = {
                paciente: {
                    nombre: String(formData.paciente?.nombre || ''),
                    apellido: String(formData.paciente?.apellido || ''),
                    fecha_nacimiento: formData.paciente?.fecha_nacimiento || '',
                    lugar_nacimiento: String(formData.paciente?.lugar_nacimiento || ''),
                    etnia: String(formData.paciente?.etnia || ''),
                    sexo: formData.paciente?.sexo || false,
                    direccion: String(formData.paciente?.direccion || ''),
                    telefono: String(formData.paciente?.telefono || ''),
                    estado: String(formData.paciente?.estado || 'Estable')
                },
                contactoEmergencia: {
                    nombre: String(contactoEmergencia?.nombre || ''),
                    telefono: String(contactoEmergencia?.telefono || ''),
                    parentesco: String(contactoEmergencia?.parentesco || '')
                },
                datosIngreso: {
                    fecha_ingreso: formData.datosIngreso?.fecha_ingreso || '',
                    fecha_egreso: formData.datosIngreso?.fecha_egreso || null,
                    etiologia_enfermedad_renal: String(formData.datosIngreso?.etiologia_enfermedad_renal || ''),
                    causa_egreso: formData.datosIngreso?.causa_egreso || null,
                    peso_ingreso_kg: formData.datosIngreso?.peso_ingreso_kg || '',
                    talla_cm: formData.datosIngreso?.talla_cm || '',
                    volumen_residual_cc: formData.datosIngreso?.volumen_residual_cc || ''
                },
                datosMedicos: {
                    hipertension_arterial: formData.datosMedicos?.hipertension_arterial || false,
                    tiempo_diagnostico: formData.datosMedicos?.tiempo_diagnostico || null,
                    diabetes: String(formData.datosMedicos?.diabetes || 'NA'),
                    tratamiento_hipertension: String(formData.datosMedicos?.tratamiento_hipertension || ''),
                    tipo_dialisis: String(formData.datosMedicos?.tipo_dialisis || ''),
                    turno: String(formData.datosMedicos?.turno || ''),
                    vih: formData.datosMedicos?.vih || false,
                    vdrl: formData.datosMedicos?.vdrl || false,
                    hbsag: formData.datosMedicos?.hbsag || false,
                    anticore: formData.datosMedicos?.anticore || false,
                    hc: formData.datosMedicos?.hc || false,
                    covid19: formData.datosMedicos?.covid19 || false
                },
                tratamientos: {
                    tratamiento: String(formData.ultimoTratamiento?.tratamiento || '')
                },
                accesoVascular: {
                    tipo: String(accesoVascular.tipo || ''),
                    fecha_realizada: accesoVascular.fecha_realizada || '',
                    ubicacion: String(accesoVascular.ubicacion || '')
                }
            };

            console.log("📤 Datos enviados al backend:", JSON.stringify(dataToSend, null, 2));

            const response = await api.put(`/pacientes/update/${cedula}`, dataToSend);

            if (response.data.success) {
                navigate(-1);
            } else {
                alert("❌ Error: " + (response.data.message || "Error desconocido"));
            }

        } catch (err: any) {
            console.error("❌ Error updating:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });

            const errorMsg = err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Error al guardar cambios";

            alert(`❌ Error: ${errorMsg}`);
        }
    };

    // Render condicional DESPUÉS de todos los hooks
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="animate-spin text-blue-600 w-10 h-10 mx-auto mb-4" />
                    <span className="text-gray-600 font-medium">Cargando expediente...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No pudimos cargar los datos</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Volver al listado
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
            <BackToPatientButton />
            <div className="max-w-5xl mx-auto">

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Editar Expediente</h1>

                {/* Renderizado Condicional Seguro */}
                {patientData ? (
                    <PatientEditForm
                        initialData={patientData}
                        onSubmit={handleUpdate}
                        onCancel={() => navigate(-1)}
                    />
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No se encontraron datos para editar.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Volver
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}

export default EditPage;