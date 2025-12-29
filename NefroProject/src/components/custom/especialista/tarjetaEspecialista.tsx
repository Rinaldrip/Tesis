import { useState } from 'react';
import {
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    User,
    HouseHeart,
    University,
    Cross,
    Stethoscope // <--- Importamos el ícono nuevo
} from 'lucide-react';
import KidneyIcon from './kidneyIcon';
import { formatCedula } from '@/helpers/formatCedula';
import { formatDate } from '@/helpers/formatDate';

interface BusinessCardData {
    fullName: string;
    dateOfBirth: string;
    specialty?: string;
    graduationYear: string;
    university: string;
    email: string;
    phone: string;
    NumColegio: string;
    NumMpps: string;
    direction?: string;
    cedula?: string;
    is_active?: boolean;
}

interface BusinessCardProps {
    data: BusinessCardData;
    isSelected?: boolean;
}

export default function TarjetaEspecialista({ data, isSelected }: BusinessCardProps) {

    const [isFlipped, setIsFlipped] = useState(false);
    const isActive = data.is_active; // Variable auxiliar para legibilidad

    return (
        <div className="perspective-1000 w-full max-w-md mx-auto">
            {/* LÓGICA DEL CONTENEDOR PRINCIPAL:
               - Si está seleccionado (isSelected): Anillo Verde (Prioridad alta para editar/borrar)
               - Si está activo (isActive) y NO seleccionado: Anillo Índigo y sombra (Indicador visual de servicio)
            */}
            <div className={`
                relative transition-all duration-300 rounded-xl
                ${isSelected
                    ? "ring-4 ring-green-500 scale-105 z-30"
                    : isActive
                        ? "ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[1.02] z-20"
                        : ""
                }
            `}>

                {/* BADGE FLOTANTE (Solo si está activo) */}
                {isActive && (
                    <div className="absolute -top-3 right-4 z-40 animate-pulse">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg border border-indigo-400">
                            <Stethoscope className="w-3 h-3 mr-1.5" />
                            EN SERVICIO
                        </span>
                    </div>
                )}

                <div
                    className={`
                        relative w-full h-72 card-flip transform-style-3d 
                        ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}
                    `}
                    onClick={() => {
                        setIsFlipped(!isFlipped);
                    }}
                >
                    {/* --- FRONT --- */}
                    <div className="absolute w-full h-full backface-hidden">
                        {/* El fondo cambia sutilmente si está activo (bg-indigo-50) vs normal (gradient slate/blue) */}
                        <div className={`
                            w-full h-full rounded-xl shadow-2xl p-6 border transition-colors duration-300
                            ${isActive
                                ? "bg-indigo-50/90 border-indigo-200"
                                : "bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200"
                            }
                        `}>
                            <div className="flex flex-col justify-between h-full">

                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <h1 className={`text-2xl font-serif font-bold mb-1 ${isActive ? "text-indigo-900" : "text-blue-900"}`}>
                                            {data.fullName}
                                        </h1>
                                        <p className="text-amber-600 text-sm font-medium tracking-wide">
                                            {data.specialty || 'Médico'}
                                        </p>
                                    </div>
                                    {/* Icono de Riñón (Opacidad reducida si está activo para no pelear con el badge) */}
                                    <div className={isActive ? "opacity-80 mt-2" : ""}>
                                        <KidneyIcon className="w-12 h-12 text-amber-600" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center text-blue-900 text-sm">
                                        <User className="w-4 h-4 mr-2 text-amber-600" />
                                        <span className="text-xs">
                                            C.I-{data.cedula ? formatCedula(data.cedula) : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-blue-900 text-sm">
                                        <Mail className="w-4 h-4 mr-2 text-amber-600" />
                                        <span className="text-xs">{data.email}</span>
                                    </div>
                                    <div className="flex items-center text-blue-900 text-sm">
                                        <Phone className="w-4 h-4 mr-2 text-amber-600" />
                                        <span className="text-xs">{data.phone}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end text-right">
                                    <div className="flex items-center text-blue-900 text-sm">
                                        <HouseHeart className="w-4 h-4 mr-2 text-amber-600" />
                                        <span className="text-xs">{data.direction}</span>
                                    </div>
                                </div>

                                <div className={`border-t pt-2 mt-2 ${isActive ? "border-indigo-200" : "border-blue-200"}`}>
                                    <p className={`text-xs text-center ${isActive ? "text-indigo-500 font-semibold" : "text-blue-600"}`}>
                                        {isActive ? "Médico Asignado Actualmente" : "Click para ver más"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- BACK (No cambia mucho, solo mantenemos consistencia) --- */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180">
                        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl shadow-2xl p-6 border border-blue-700/30">
                            <div className="flex flex-col justify-between h-full">

                                <div>
                                    <h2 className="text-lg font-serif font-bold text-white mb-4 text-center border-b border-blue-700/50 pb-2">
                                        Credenciales Profesionales
                                    </h2>

                                    <div className="space-y-4">

                                        <div className="flex items-start">
                                            <GraduationCap className="w-5 h-5 mr-3 text-amber-400" />
                                            <div>
                                                <p className="text-xs text-blue-300 font-semibold">Graduado</p>
                                                <p className="text-sm text-white font-medium">{data.graduationYear}</p>
                                                <p className="text-xs text-blue-200 mt-0.5">{data.university}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 mr-3 text-amber-400" />
                                            <div>
                                                <p className="text-xs text-blue-300 font-semibold">Fecha de Nacimiento</p>
                                                <p className="text-sm text-white font-medium">{formatDate(data.dateOfBirth)}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start">
                                                <University className="w-5 h-5 mr-2 text-amber-400" />
                                                <div>
                                                    <p className="text-xs text-blue-300 font-semibold">Núm. Colegio</p>
                                                    <p className="text-sm text-white font-medium font-mono">{data.NumColegio}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start">
                                                <Cross className="w-5 h-5 mr-2 text-amber-400" />
                                                <div>
                                                    <p className="text-xs text-blue-300 font-semibold">Núm. MPPS</p>
                                                    <p className="text-sm text-white font-medium font-mono">{data.NumMpps}</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="border-t border-blue-700/50 pt-2 mt-2">
                                    <p className="text-blue-300 text-xs text-center">Click para volver</p>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}