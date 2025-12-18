import { ArrowLeft, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

interface BackToPatientButtonProps {
    patientName?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    sticky?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    offset?: number;
    showCloseButton?: boolean;
    autoHide?: boolean;
    blurBackground?: boolean;
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function BackToPatientButton({
    patientName,
    variant = 'default',
    size = 'default',
    className = '',
    sticky = true,
    position = 'top-left',
    offset = 20,
    showCloseButton = false,
    autoHide = false,
    blurBackground = false,
    borderRadius = 'lg' // Más esquinado por defecto
}: BackToPatientButtonProps) {
    const navigate = useNavigate();
    const { cedula } = useParams<{ cedula: string }>();
    const [isVisible, setIsVisible] = useState(true);

    const handleBackToPatient = () => {
        if (cedula) {
            navigate(`/pacientes/${cedula}`);
        } else {
            navigate(-1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    // Configuración de bordes redondeados
    const borderRadiusClasses = {
        'none': 'rounded-none',
        'sm': 'rounded-sm',
        'md': 'rounded-md',
        'lg': 'rounded-lg',
        'xl': 'rounded-xl',
        'full': 'rounded-full'
    };

    // Configuración de posición sticky
    const positionClasses = {
        'top-left': `top-${offset} left-${offset}`,
        'top-right': `top-${offset} right-${offset}`,
        'bottom-left': `bottom-${offset} left-${offset}`,
        'bottom-right': `bottom-${offset} right-${offset}`
    };

    const baseClasses = `
        group relative overflow-hidden transition-all duration-300 
        hover:scale-105 active:scale-95 ${className}
        ${blurBackground ? 'backdrop-blur-sm bg-white/80' : ''}
        ${borderRadiusClasses[borderRadius]}
    `;

    const stickyClasses = sticky
        ? `fixed ${positionClasses[position]} z-50 shadow-lg hover:shadow-xl transition-all duration-300`
        : '';

    const visibilityClasses = autoHide
        ? `transform transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
        }`
        : '';

    if (!isVisible) return null;

    return (
        <div className={`${stickyClasses} ${visibilityClasses} ${borderRadiusClasses[borderRadius]}`}>
            <Button
                onClick={handleBackToPatient}
                variant={variant}
                size={size}
                className={baseClasses}
            >
                {/* Efecto de fondo animado */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${borderRadiusClasses[borderRadius]}`} />

                {/* Contenido del botón */}
                <div className="relative flex items-center gap-2 z-10">
                    <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    {patientName ? (
                        <>
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Volver a {patientName}</span>
                            <span className="sm:hidden">Paciente</span>
                        </>
                    ) : (
                        <span>Volver al Paciente</span>
                    )}
                </div>

                {/* Efecto de borde animado */}
                <div className={`absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300 ${borderRadiusClasses[borderRadius]}`} />
            </Button>

            {/* Botón de cerrar (opcional) */}
            {showCloseButton && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className={`absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white p-0 min-w-0 z-50 ${borderRadiusClasses[borderRadius]}`}
                >
                    <X className="w-3 h-3" />
                </Button>
            )}
        </div>
    );
}