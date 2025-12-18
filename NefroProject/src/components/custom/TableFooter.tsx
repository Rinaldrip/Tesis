// components/TableFooter.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TableFooterProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    showingText?: string;
}

export function TableFooter({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showingText = "Showing"
}: TableFooterProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
                {/* Información de la página actual */}
                <div className="text-sm text-gray-600">
                    {showingText} {startItem}-{endItem} de {totalItems} filas.
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anetrior</span>
                    </Button>

                    {/* Números de página */}
                    <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber: number;

                            // Lógica para mostrar páginas alrededor de la página actual
                            if (totalPages <= 5) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                            } else {
                                pageNumber = currentPage - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNumber}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNumber)}
                                    className={`min-w-[40px] ${currentPage === pageNumber
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-700"
                                        }`}
                                >
                                    {pageNumber}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-1"
                    >
                        <span>Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}