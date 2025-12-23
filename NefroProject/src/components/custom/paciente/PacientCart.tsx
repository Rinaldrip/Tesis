// components/custom/paciente/PacientCart.tsx
import { CheckCircle, AlertTriangle, Clock, ShieldCheck, ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateAge } from '@/helpers/calculateAge';
import { formatCedula } from '@/helpers/formatCedula';

interface Patient {
    id: number;
    cedula: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    enfermedad: string;
    estado: string | 'Estable' | 'Critico' | 'Mejorando' | 'Activo' | 'Inactivo';
    ultimaVisita: string;
    creatinina: string;
    proteinasT: string;
}

interface PacientCartProps {
    patient: Patient;
}

export const PacientCart = ({ patient }: PacientCartProps) => {
    const navigate = useNavigate();

    const getStatusColor = (status: Patient['estado']) => {
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

    const getStatusIcon = (status: Patient['estado']) => {
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

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'No disponible';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';

            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return 'Fecha inválida';
        }
    };

    const StatusIcon = getStatusIcon(patient.estado);

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer bg-white h-full flex flex-col">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {patient.nombre} {patient.apellido}
                    </h3>
                    <p className="text-sm text-gray-600">Edad: {calculateAge(patient.fechaNacimiento) || 'N/A'}</p>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.estado)} ml-2 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    <span className="capitalize">{patient.estado}</span>
                </div>
            </div>

            <div className="mb-3 flex-1">
                <p className="text-sm text-gray-800 font-medium line-clamp-2">
                    {patient.enfermedad || 'Enfermedad no especificada'}
                </p>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                    <span className="text-gray-500">Cédula:</span>
                    <span className="font-medium text-gray-900">{formatCedula(patient.cedula) || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Fecha de ingreso:</span>
                    <span className="font-medium text-gray-900">{formatDate(patient.ultimaVisita)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Creatinina:</span>
                    <span className="font-medium text-gray-900">{patient.creatinina || 'No disponible'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Proteínas T:</span>
                    <span className="font-medium text-gray-900">{patient.proteinasT || 'No disponible'}</span>
                </div>
            </div>

            {/* Botón Ver más */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/pacientes/${patient.cedula || patient.id}`);
                }}
                className="w-full mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
            >
                Ver más
            </button>
        </div>
    );
};