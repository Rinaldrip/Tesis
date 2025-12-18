import { useState } from 'react';
import { Mail, Phone, GraduationCap, Calendar, User, HouseHeart, University, Cross } from 'lucide-react';
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
}

interface BusinessCardProps {
    data: BusinessCardData;
    isSelected?: boolean;

}

export default function TarjetaEspecialista({ data, isSelected }: BusinessCardProps) {

    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="perspective-1000 w-full max-w-md mx-auto">
            <div className={`relative transition-all duration-300 ${isSelected ? "ring-4 ring-green-500 scale-105" : ""}`}>

                <div
                    className={`
                        relative w-full h-72 card-flip transform-style-3d 
                        ${isFlipped ? 'rotate-y-180' : 'rotate-y-0'}
                    `}
                    onClick={() => {
                        setIsFlipped(!isFlipped);
                    }}
                >
                    {/* FRONT */}
                    <div className="absolute w-full h-full backface-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-2xl p-6 border border-blue-200">
                            <div className="flex flex-col justify-between h-full">

                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-serif font-bold text-blue-900 mb-1">
                                            {data.fullName}
                                        </h1>
                                        <p className="text-amber-600 text-sm font-medium tracking-wide">
                                            {data.specialty || 'Médico'}
                                        </p>
                                    </div>
                                    <KidneyIcon className="w-12 h-12 text-amber-600" />
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

                                <div className="border-t border-blue-200 pt-2 mt-2">
                                    <p className="text-blue-600 text-xs text-center">Click para ver más</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BACK */}
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
