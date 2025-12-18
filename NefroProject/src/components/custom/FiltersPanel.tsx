import { motion } from "framer-motion";
import { Calendar, Filter } from "lucide-react";
import type { DateRangeFilter } from "@/types/patientStats";

interface FiltersPanelProps {
    selectedFilter: DateRangeFilter;
    onFilterChange: (filter: DateRangeFilter) => void;
    totalResults?: number;
    isLoading?: boolean;
    className?: string;
}

const FILTER_OPTIONS: Array<{
    value: DateRangeFilter;
    label: string;
    description: string;
}> = [
        { value: "3meses", label: "3 Meses", description: "Últimos 90 días" },
        { value: "6meses", label: "6 Meses", description: "Últimos 180 días" },
        { value: "anual", label: "1 Año", description: "Últimos 12 meses" },
        { value: "todo", label: "Todo", description: "Todo el historial" },
    ];

export function FiltersPanel({
    selectedFilter,
    onFilterChange,
    isLoading = false,
    className = "",
}: FiltersPanelProps) {
    const currentOption = FILTER_OPTIONS.find(
        (opt) => opt.value === selectedFilter
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 ${className}`}
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                        <Filter className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Filtros de Tiempo
                        </h3>
                        <p className="text-sm text-gray-500">
                            Selecciona el rango de fechas para los resultados
                            {isLoading && (
                                <span className="ml-2 text-gray-400 animate-pulse">
                                    (actualizando...)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS.map((option) => {
                        const isActive = selectedFilter === option.value;
                        return (
                            <motion.button
                                key={option.value}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onFilterChange(option.value)}
                                aria-pressed={isActive}
                                disabled={isLoading}
                                className={`
                            relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                            border min-w-[110px] text-center group
                            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                            ${isActive
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                                    }
                    ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className="absolute inset-0 bg-blue-600 rounded-lg"
                                        transition={{
                                            type: "spring",
                                            bounce: 0.25,
                                            duration: 0.5,
                                        }}
                                    />
                                )}

                                <span className="relative z-10 flex flex-col items-center">
                                    <span className="font-semibold">{option.label}</span>
                                    <span
                                        className={`text-xs mt-0.5 ${isActive ? "text-blue-100" : "text-gray-500"
                                            }`}
                                    >
                                        {option.description}
                                    </span>
                                </span>

                                {/* Hover effect layer */}
                                <div
                                    className={`
                    absolute inset-0 rounded-lg transition-opacity duration-200
                    ${isActive
                                            ? "bg-blue-700"
                                            : "bg-blue-500 opacity-0 group-hover:opacity-5"
                                        }
                    `}
                                />
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Selected filter summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 pt-4 border-t border-gray-100"
            >
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                            Período seleccionado:{" "}
                            <strong className="text-gray-800">
                                {currentOption?.label ?? "—"}
                            </strong>
                        </span>
                    </div>
                    {selectedFilter !== "3meses" && (
                        <button
                            onClick={() => onFilterChange("3meses")}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                            Limpiar filtro
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
