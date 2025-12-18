import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    AlertCircle,
    Info,
} from "lucide-react";
import type { LabIndicator, LabStats } from "@/types/patientStats";

interface EnhancedLabStats extends LabStats {
    current: number;
    average: number;    // Promedio
    min: number;        // Mínimo
    max: number;        // Máximo
    trend: number;
}

interface StatsOverviewProps {
    indicators: LabIndicator[];
    stats: Record<string, EnhancedLabStats>;
}

export function StatsOverview({ indicators, stats }: StatsOverviewProps) {
    const getStatusIcon = (indicator: LabIndicator, value?: number) => {
        if (value === undefined || value === null)
            return <Minus className="w-4 h-4 text-gray-400" />;

        if (value < indicator.normalRange.min)
            return <TrendingDown className="w-4 h-4 text-red-500" />;
        if (value > indicator.normalRange.max)
            return <TrendingUp className="w-4 h-4 text-red-500" />;

        return <Minus className="w-4 h-4 text-green-500" />;
    };

    const getStatusColor = (indicator: LabIndicator, value?: number) => {
        if (value === undefined || value === null)
            return "border-gray-200 bg-gray-50";
        if (value < indicator.normalRange.min || value > indicator.normalRange.max)
            return "border-red-200 bg-red-50";
        return "border-green-200 bg-green-50";
    };

    const getTrendInfo = (trend?: number, unit?: string) => {
        if (trend === undefined || trend === 0)
            return { text: "No change", color: "text-gray-500", icon: <Minus className="w-3 h-3" /> };

        return trend > 0
            ? {
                text: `+${trend.toFixed(2)}${unit ?? ""}`,
                color: "text-red-500",
                icon: <TrendingUp className="w-3 h-3" />,
            }
            : {
                text: `${trend.toFixed(2)}${unit ?? ""}`,
                color: "text-green-500",
                icon: <TrendingDown className="w-3 h-3" />,
            };
    };

    const getValueStatus = (indicator: LabIndicator, value?: number) => {
        if (value === undefined || value === null) return "unknown";
        if (value < indicator.normalRange.min) return "low";
        if (value > indicator.normalRange.max) return "high";
        return "normal";
    };

    const indicatorsWithData = indicators.filter(
        (indicator) => stats[indicator.key]
    );

    if (indicatorsWithData.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
            >
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-700">
                    No hay datos suficientes para mostrar estadísticas.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                    Resumen de Indicadores
                </h2>
                <div className="relative group">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute left-6 top-0 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Promedio de valores en el período seleccionado. Los colores
                        indican si los valores están fuera del rango normal.
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {indicatorsWithData.map((indicator, index) => {
                    const stat = stats[indicator.key];
                    const value = stat?.average ?? 0;
                    const status = getValueStatus(indicator, value);
                    const trendInfo = getTrendInfo(stat?.trend, indicator.unit);

                    return (
                        <motion.div
                            key={indicator.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`bg-white rounded-xl shadow-sm p-4 border-2 ${getStatusColor(
                                indicator,
                                value
                            )} hover:shadow-md transition-shadow`}
                        >
                            {/* Title */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">
                                        {indicator.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stat?.current ? "Último valor" : "Sin datos recientes"}
                                    </p>
                                </div>
                                {getStatusIcon(indicator, value)}
                            </div>

                            {/* Main Value */}
                            <div className="mb-3">
                                <div className="flex items-baseline gap-1">
                                    <p
                                        className="text-2xl font-bold"
                                        style={{ color: indicator.color }}
                                    >
                                        {value.toFixed(2)}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        {indicator.unit}
                                    </span>
                                </div>

                                {stat?.trend !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {trendInfo.icon}
                                        <span className={`text-xs ${trendInfo.color}`}>
                                            {trendInfo.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Ranges */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-500">Rango normal:</span>
                                    <span className="font-medium text-gray-700">
                                        {indicator.normalRange.min}-{indicator.normalRange.max}
                                        {indicator.unit}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1 border-t border-gray-100">
                                    <div className="text-center">
                                        <p className="text-gray-500">Mín</p>
                                        <p className="font-medium text-blue-600">
                                            {stat?.min?.toFixed(2) ?? "-"}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-gray-500">Máx</p>
                                        <p className="font-medium text-red-600">
                                            {stat?.max?.toFixed(2) ?? "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status === "normal"
                                            ? "bg-green-100 text-green-800"
                                            : status === "low"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : status === "high"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {status === "normal"
                                            ? "Dentro del rango"
                                            : status === "low"
                                                ? "Por debajo"
                                                : status === "high"
                                                    ? "Por encima"
                                                    : "Sin datos"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-100 border-2 border-green-200 rounded"></div>
                    <span>Dentro del rango normal</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border-2 border-red-200 rounded"></div>
                    <span>Fuera del rango normal</span>
                </div>
            </div>
        </div>
    );
}
