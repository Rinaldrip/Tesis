// components/custom/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    className = ''
}: PaginationProps) => {
    if (totalPages <= 1) return null;

    const startItem = currentPage * itemsPerPage + 1;
    const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

    return (
        <div className={`flex items-center justify-between ${className}`}>
            {/* Información de items mostrados */}
            <div className="text-sm text-gray-600">
                Mostrando {startItem}-{endItem} de {totalItems} pacientes
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center space-x-4">
                {/* Botones de navegación */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === 0}
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === totalPages - 1}
                    >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {/* Indicadores de página */}
                <div className="flex space-x-1">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onPageChange(index)}
                            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${currentPage === index
                                ? 'bg-blue-900'
                                : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            aria-label={`Ir a página ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};