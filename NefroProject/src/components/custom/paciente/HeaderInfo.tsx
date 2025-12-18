import { User, Phone, Calendar, Stethoscope, Cake, HeartCrack, Activity, BrainCog, AlertTriangle, CheckCircle, Clock, ShieldCheck, ShieldX, CandyOff } from "lucide-react";
import { capitalizeFirstLetter } from "@/helpers/mayuscula";
import { formatDate } from "@/helpers/formatDate";
import { calculateAge } from "@/helpers/calculateAge";
import { formatCedula } from "@/helpers/formatCedula";

// Interface corregida según tu estructura de BD real
interface PatientData {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    fecha_nacimiento?: string;
    estado: string;
    diabetes?: string;
    fecha_ingreso?: string;
    tipo?: string;
    fecha_realizada?: string;
    tipo_dialisis?: string;
    etiologia_enfermedad_renal?: string;
    hipertension_arterial?: boolean;
}

interface PatientHeaderProps {
    patientData: PatientData;
}

export default function PatientHeader({ patientData }: PatientHeaderProps) {
    const {
        nombre,
        apellido,
        cedula,
        telefono,
        fecha_nacimiento,
        fecha_ingreso,
        tipo,
        fecha_realizada,
        tipo_dialisis,
        diabetes,
        etiologia_enfermedad_renal,
        hipertension_arterial
    } = patientData;

    const getStatusColor = (status: PatientData['estado']) => {
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

    const getStatusIcon = (status: PatientData['estado']) => {
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

    const diabetesKey = patientData?.diabetes as keyof typeof diabetesConfig | undefined;

    const diabetesInfo = diabetesKey ? diabetesConfig[diabetesKey] : {
        text: 'No especificado',
        className: 'bg-gray-100 text-gray-800'
    };

    const formatBoolean = (value?: boolean) => {
        if (value === undefined || value === null) return 'No especificado';
        return value ? 'Sí' : 'No';
    };

    const StatusIcon = getStatusIcon(patientData.estado);

    const tipoAcceso = (tipo: string | undefined | null): string => {
        if (!tipo) return "N/A";

        const tipoNormalizado = tipo.toLowerCase().trim();

        switch (tipoNormalizado) {
            case "fistula":
                return "Fístula Arteriovenosa";
            case "cateter-per":
                return "Catéter Permacath";
            default:
                return "Catéter Temporal";
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-white">
                                {nombre} {apellido}
                            </h1>
                            <p className="text-red-100 text-sm mt-1">
                                Información del paciente • C.I: {formatCedula(cedula)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-base font-semibold ${getStatusColor(patientData.estado)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="capitalize">{patientData.estado}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Teléfono */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Teléfono
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{telefono || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Edad */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Cake className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Edad
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {calculateAge(fecha_nacimiento)}
                            </p>
                            {fecha_nacimiento && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Nac: {formatDate(fecha_nacimiento)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Fecha de ingreso */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Fecha de ingreso
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatDate(fecha_ingreso)}
                            </p>
                        </div>
                    </div>

                    {/* Enfermedad Renal */}
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Etiología Enf. Renal
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {etiologia_enfermedad_renal || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información secundaria - SOLUCIÓN CORREGIDA */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Acceso Vascular */}
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Acceso Vascular
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1 min-w-0">
                                        <span className="text-xs text-gray-500 block mb-0.5">Tipo</span>
                                        <span className="text-sm font-semibold text-gray-900 truncate block">
                                            {tipoAcceso(tipo) || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 flex-1 min-w-0">
                                        <span className="text-xs text-gray-500 block mb-0.5">Fecha</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatDate(fecha_realizada)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hipertensión Arterial */}
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <HeartCrack className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Hipertensión Arterial
                                </p>
                                <div className="flex flex-col gap-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${hipertension_arterial
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {formatBoolean(hipertension_arterial)}
                                    </span>
                                    {hipertension_arterial !== undefined && hipertension_arterial !== null && (
                                        <p className="text-xs text-gray-500">
                                            {hipertension_arterial ? 'Control requerido' : 'Bajo control'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Diabetes */}
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <CandyOff className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Diabetes
                                </p>
                                <div className="flex flex-col gap-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${diabetesInfo.className}`}>{diabetesInfo.text}
                                    </span>
                                    {diabetes && diabetes !== 'sinDiabetes' && (
                                        <p className="text-xs text-gray-500">
                                            Manejo especializado
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Diálisis */}
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <BrainCog className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Diálisis
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {capitalizeFirstLetter(tipo_dialisis) || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}