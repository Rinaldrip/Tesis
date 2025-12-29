import { User, Heart, Activity, TestTube, Stethoscope, FlaskConical, Plus, Edit, Trash2, BrainCog, Loader, AlertTriangle, CheckCircle, Clock, ShieldCheck, ShieldX } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import type { PatientData } from '../../types/patientInterface';
import { pacienteByID } from '@/services/paciente-show';
import { calculateAge } from '@/helpers/calculateAge';
import { formatDate } from '@/helpers/formatDate';
import { capitalizeFirstLetter } from '@/helpers/mayuscula';
import { formatCedula } from '@/helpers/formatCedula';

function PatientProfile() {
    const navigate = useNavigate();
    const { cedula } = useParams<{ cedula: string }>();
    const [patientData, setPatientData] = useState<PatientData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Función para formatear valores booleanos
    const formatBoolean = (value?: boolean) => {
        if (value === undefined || value === null) return 'No especificado';
        return value ? 'Positivo' : 'Negativo';
    };
    const formatSexo = (value?: boolean) => {
        if (value === undefined || value === null) return 'No especificado';
        return value ? 'Masculino' : 'Femenino';
    };

    // Cargar datos del paciente
    useEffect(() => {
        const loadPatientData = async () => {
            if (!cedula) {
                setError('Cédula no proporcionada');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const data = await pacienteByID(cedula);
                setPatientData(data);
            } catch (err: any) {
                console.error('Error loading patient data:', err);
                setError(err.response?.data?.error || 'Error al cargar los datos del paciente');
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [cedula]);

    // Después de cargar los datos, agrega esto:
    useEffect(() => {
        if (patientData) {
            console.log("Datos del Paciente Cargados:", patientData);
            // Verifica que los datos sean correctos
            console.log("Paciente:", patientData.paciente);
            console.log("Laboratorio:", patientData.ultimoLaboratorio);
        }
    }, [patientData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando información del paciente...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <div className="text-red-600 text-4xl mb-2">⚠️</div>
                        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/pacientes')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                            Volver a la lista
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Cambia esta parte del componente:
    if (!patientData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No se encontraron datos del paciente.</p>
                </div>
            </div>
        );
    }

    // CORRECCIÓN: Usa los nombres correctos del backend
    const {
        paciente,
        datosIngreso,
        datosMedicos,
        contactosEmergencia,
        accesosVasculares,
        ultimoLaboratorio,
        ultimoTratamiento
    } = patientData;

    // Obtener el primer contacto de emergencia (si existe el array)
    const contactoEmergencia = contactosEmergencia && contactosEmergencia.length > 0 ? contactosEmergencia[0] : null;

    // Obtener el primer acceso vascular (si existe el array)
    const accesoVascular = accesosVasculares && accesosVasculares.length > 0 ? accesosVasculares[0] : null;

    // Laboratorio tiene nombre diferente
    const laboratorio = ultimoLaboratorio;

    const getStatusColor = (status: typeof paciente['estado']) => {
        switch (status) {
            case 'Estable':
                return 'text-green-600 bg-green-100 border border-green-200';
            case 'Critico':
                return 'text-red-600 bg-red-100 border border-red-200';
            case 'Mejorando':
                return 'text-yellow-600 bg-yellow-100 border border-yellow-200';
            case 'Activo':
                return 'text-blue-600 bg-blue-100 border border-blue-200';
            case 'Inactivo':
                return 'text-gray-600 bg-gray-100 border border-gray-200';
            default:
                return 'text-blue-600 bg-blue-100 border border-blue-200';
        }
    };

    const getStatusIcon = (status: typeof paciente['estado']) => {
        switch (status) {
            case 'Estable':
                return CheckCircle;
            case 'Critico':
                return AlertTriangle;
            case 'Mejorando':
                return Clock;
            case 'Activo':
                return ShieldCheck;
            case 'Inactivo':
                return ShieldX;
            default:
                return ShieldCheck;
        }
    };

    const diabetesConfig = {
        NA: { text: 'No padece de Diabetes', className: 'bg-green-100 text-green-800' },
        diabetes1: { text: 'Diabetes Mellitus Tipo 1', className: 'bg-yellow-100 text-yellow-800' },
        diabetes2: { text: 'Diabetes Mellitus Tipo 2', className: 'bg-orange-100 text-orange-800' }
    };

    const diabetesKey = datosMedicos?.diabetes as keyof typeof diabetesConfig | undefined;

    const diabetesInfo = diabetesKey ? diabetesConfig[diabetesKey] : {
        text: 'No especificado',
        className: 'bg-gray-100 text-gray-800'
    };

    const StatusIcon = getStatusIcon(paciente.estado);

    const tipoDialisis = (tipo_dialisis: string | undefined | null): string => {
        if (!tipo_dialisis) return "No tiene Diálisis Asignada";

        const tipoNormalizado = tipo_dialisis.trim();

        switch (tipoNormalizado) {
            case "Hemodialisis":
            case "hemodialisis":
                return "Hemodiálisis";
            case "Peritoneal":
            case "peritoneal":
                return "Diálisis Peritoneal";
            default:
                return tipo_dialisis; // Devuelve el valor original si no coincide
        }
    }

    const tipoAcceso = (tipo: string | undefined | null): string => {

        const tipoNormalizado = tipo?.toLowerCase().trim();

        switch (tipoNormalizado) {
            case "fistula":
                return "Fístula Arteriovenosa";
            case "cateter-per":
                return "Catéter Permacath";
            case "cateter-tem":
                return "Catéter Temporal";
            default:
                return "No tiene Acceso Vascular";
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header con botón de volver */}
                <div className="mb-6">

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        {paciente.nombre} {paciente.apellido}
                                    </h1>
                                    <p className="text-gray-600">Cédula: {formatCedula(paciente.cedula)}</p>
                                    <p className="text-sm text-gray-500">
                                        Edad: {calculateAge(paciente.fecha_nacimiento)} años •
                                        Fecha de Nacimiento: {formatDate(paciente.fecha_nacimiento)}
                                    </p>
                                </div>
                            </div>

                            {/* Estado más grande y destacado */}
                            <div className="text-right">
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold ${getStatusColor(paciente.estado)}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="capitalize">{paciente.estado}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información Personal */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                                <p className="text-gray-900">{paciente.nombre || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Apellido</label>
                                <p className="text-gray-900">{paciente.apellido || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Cédula</label>
                                <p className="text-gray-900">{formatCedula(paciente.cedula)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                                <p className="text-gray-900">{paciente.telefono || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Sexo</label>
                                <p className="text-gray-900">{formatSexo(paciente.sexo)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Etnia</label>
                                <p className="text-gray-900">{paciente.etnia || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                                <p className="text-gray-900">{formatDate(paciente.fecha_nacimiento) || "No especificado"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Lugar de Nacimiento</label>
                                <p className="text-gray-900">{paciente.lugar_nacimiento || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-500">Dirección</label>
                            <p className="text-gray-900">{paciente.direccion || 'No especificado'}</p>
                        </div>

                        {/* Contacto de Emergencia */}
                        {contactoEmergencia && (
                            <div className="mt-4 p-4 bg-red-50 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Contacto de Emergencia</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Nombre</label>
                                        <p className="text-gray-900">{contactoEmergencia.nombre}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                                        <p className="text-gray-900">{contactoEmergencia.telefono}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Parentesco</label>
                                        <p className="text-gray-900">{contactoEmergencia.parentesco}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Datos Clínicos */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Stethoscope className="w-5 h-5 text-teal-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Datos Clínicos</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Fecha de Ingreso</label>
                                <p className="text-gray-900">{formatDate(datosIngreso?.fecha_ingreso)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Fecha de Egreso</label>
                                <p className="text-gray-900">{datosIngreso?.fecha_egreso || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Peso al Ingreso (KG)</label>
                                <p className="text-gray-900">{datosIngreso?.peso_ingreso_kg || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Talla (cm)</label>
                                <p className="text-gray-900">{datosIngreso?.talla_cm || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Volumen Residual (cc)</label>
                                <p className="text-gray-900">{datosIngreso?.volumen_residual_cc || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Causa de Egreso</label>
                                <p className="text-gray-900">{datosIngreso?.causa_egreso || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Tratamiento</label>
                                <p className="text-gray-900">{ultimoTratamiento?.tratamiento || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Hipertensión Arterial */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Heart className="w-5 h-5 text-red-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Hipertensión Arterial y Diabetes</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Hipertensión Arterial</label>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${datosMedicos?.hipertension_arterial
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {formatBoolean(datosMedicos?.hipertension_arterial)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Tiempo de Diagnóstico</label>
                                <p className="text-gray-900">{datosMedicos?.tiempo_diagnostico || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Tratamiento para Hipertensión</label>
                                <p className="text-gray-900">{datosMedicos?.tratamiento_hipertension || 'No especificado'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Diabetes</label>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${diabetesInfo.className}`}>
                                    {diabetesInfo.text}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Diálisis */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <BrainCog className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Diálisis</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Tipo de Diálisis</label>
                            <p className="text-gray-900">{tipoDialisis(capitalizeFirstLetter(datosMedicos?.tipo_dialisis)) || 'No especificado'}</p>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Etiología de Enfermedad Renal</label>
                                <p className="text-gray-900">{datosIngreso?.etiologia_enfermedad_renal || 'No especificado'}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Turno de Diálisis</label>
                                <p className="text-gray-900">{datosMedicos?.turno || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Serología */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <TestTube className="w-5 h-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Serología</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {datosMedicos && (
                                <>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">VIH</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.vih ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.vih)}
                                        </span>
                                    </div>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">VDRL</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.vdrl ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.vdrl)}
                                        </span>
                                    </div>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">HBsAg</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.hbsag ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.hbsag)}
                                        </span>
                                    </div>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">Anticore</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.anticore ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.anticore)}
                                        </span>
                                    </div>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">HC</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.hc ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.hc)}
                                        </span>
                                    </div>
                                    <div className="text-center p-3 rounded-lg border">
                                        <label className="block text-sm font-medium text-gray-500 uppercase">COVID-19</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${datosMedicos.covid19 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {formatBoolean(datosMedicos.covid19)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Acceso Vascular */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Activity className="w-5 h-5 text-orange-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Acceso Vascular</h2>
                        </div>
                        {accesoVascular ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Tipo</label>
                                    <p className="text-gray-900">{tipoAcceso(accesoVascular.tipo)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Fecha Realizada</label>
                                    <p className="text-gray-900">{formatDate(accesoVascular.fecha_realizada)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Ubicación</label>
                                    <p className="text-gray-900">{accesoVascular.ubicacion}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No hay información de acceso vascular</p>
                        )}
                    </div>

                    {/* Laboratorio de Ingreso */}
                    {/* Laboratorio de Ingreso */}
                    {laboratorio && (
                        <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <FlaskConical className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Laboratorio {laboratorio.fecha && `- ${formatDate(laboratorio.fecha)}`}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {Object.entries(laboratorio).map(([key, value]) => {
                                    if (key === 'fecha' || value === undefined || value === null) return null;

                                    // Asegúrate de que value sea un valor primitivo
                                    const displayValue = (() => {
                                        if (typeof value === 'object') {
                                            return JSON.stringify(value); // Convierte objetos a string
                                        }
                                        if (typeof value === 'boolean') {
                                            return value ? 'Positivo' : 'Negativo';
                                        }
                                        return value;
                                    })();

                                    return (
                                        <div key={key} className="text-center p-3 rounded-lg bg-gray-50">
                                            <label className="block text-sm font-medium text-gray-500 uppercase mb-1">
                                                {key.replace('_', ' ')}
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">{displayValue}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                            onClick={() => navigate(`/pacientes/${paciente.cedula}/evo`)}
                        >
                            <Plus className="w-5 h-5" />
                            <span>Añadir evolución</span>
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                            onClick={() => navigate(`/pacientes/${paciente.cedula}/editar`)}
                        >
                            <Edit className="w-5 h-5" />
                            <span>Editar información</span>
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer">
                            <Trash2 className="w-5 h-5" />
                            <span>Eliminar perfil</span>
                        </button>
                        <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                            onClick={() => navigate(`/pacientes/${paciente.cedula}/stats`)}>
                            <Activity className="w-5 h-5" />
                            <span>Estadísticas del paciente</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientProfile;