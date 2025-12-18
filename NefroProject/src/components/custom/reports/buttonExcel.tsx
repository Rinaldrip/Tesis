import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { api } from '@/services/paciente.api';
import { motion } from 'framer-motion';

interface ButtonExcelProps {
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    sticky?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    offset?: number;
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    buttonText?: string;
    showTooltip?: boolean;
}

export default function ButtonExcel({
    variant = 'default',
    size = 'default',
    className = '',
    sticky = true,
    position = 'bottom-right',
    offset = 20,
    borderRadius = 'lg',
    buttonText = 'Descargar Reporte',
    showTooltip = true,
}: ButtonExcelProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleGenerateReport = async () => {
        try {
            setIsGenerating(true);
            setProgress(10);

            const [view, resumen, demograficos, clinicos] = await Promise.all([
                api.get('/reporte/viewStats/3meses'),
                api.get('/reporte/ReporteGeneral/total'),
                api.get('/reporte/datosDemograficos'),
                api.get('/reporte/DatosClinicos/todo'),
            ]);

            console.log("✅ Datos antes de enviar reporte:");
            console.log("Resumen:", resumen.data);
            console.log("View:", view.data);
            console.log("Demográficos:", demograficos.data);
            console.log("Clínicos:", clinicos.data);


            setProgress(50);

            const reportData = {
                datosEndpoint1: (resumen.data),
                datosEndpoint2: (view.data),
                datosEndpoint3: (demograficos.data),
                datosEndpoint4: (clinicos.data),
            };


            const response = await api.post('/generar-reporte', reportData, {
                responseType: 'blob',
                onDownloadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
                },
            });

            setProgress(90);

            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_nefrologia_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setProgress(100);
            setTimeout(() => setProgress(0), 800);
        } catch (error) {
            console.error('Error generando reporte:', error);
            alert('Error al generar el reporte. Por favor, intente nuevamente.');
            setProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    const borderRadiusClasses: Record<string, string> = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    const getPosition = (pos: string) => {
        switch (pos) {
            case 'top-left':
                return { top: offset, left: offset };
            case 'top-right':
                return { top: offset, right: offset };
            case 'bottom-left':
                return { bottom: offset, left: offset };
            case 'bottom-right':
            default:
                return { bottom: offset, right: offset };
        }
    };

    const stickyStyle = sticky
        ? { position: 'fixed' as const, ...getPosition(position), zIndex: 50 }
        : {};

    // Determina el color de la barra según el progreso
    const getProgressColor = () => {
        if (progress < 30) return 'bg-green-400';
        if (progress < 70) return 'bg-yellow-400';
        return 'bg-blue-500';
    };

    // Gradiente dinámico para una transición más fluida
    const getProgressGradient = () => {
        if (progress < 30) return 'from-green-400 to-green-500';
        if (progress < 70) return 'from-yellow-400 to-yellow-500';
        return 'from-blue-400 to-blue-500';
    };

    return (
        <div className="group" style={stickyStyle}>
            <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                variant={variant}
                size={size}
                className={`
          relative overflow-hidden transition-all duration-300
          hover:scale-105 active:scale-95
          bg-green-600 hover:bg-green-700 text-white
          ${borderRadiusClasses[borderRadius]}
          ${isGenerating ? 'opacity-80 cursor-wait' : ''}
          ${className}
        `}
            >
                {/* Fondo animado */}
                <div
                    className={`absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${borderRadiusClasses[borderRadius]}`}
                />

                {/* Contenido */}
                <div className="relative flex items-center gap-2 z-10">
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileDown className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">
                        {isGenerating ? 'Generando...' : buttonText}
                    </span>
                    <span className="sm:hidden">
                        {isGenerating ? '...' : 'Reporte'}
                    </span>
                </div>

                {/* Barra de progreso dinámica */}
                {isGenerating && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeInOut', duration: 0.3 }}
                        className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${getProgressGradient()} ${getProgressColor()} transition-colors duration-500`}
                    />
                )}

                {/* Borde animado */}
                <div
                    className={`absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300 ${borderRadiusClasses[borderRadius]}`}
                />
            </Button>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                    <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-md">
                        Generar reporte completo en Excel
                    </div>
                </div>
            )}
        </div>
    );
}
