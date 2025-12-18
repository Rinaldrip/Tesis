import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingDown,
    TrendingUp,
    Minus,
    AlertTriangle,
    Users,
    Activity,
    HeartCrack,
    Calendar,
    CandyOff,
    BrainCog,
    UserMinus,
} from "lucide-react";

interface ViewStatsProps {
    stats: Record<string, any>;
}

export const ViewStats: React.FC<ViewStatsProps> = ({ stats }) => {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const total = stats?.pacientes_activos?.total ?? 1;

    // Obtener el período desde los stats o usar uno por defecto
    const periodo = stats?.periodo || "Últimos 3 meses";

    // Indicators adaptados a la nueva estructura JSON
    const indicators = [
        {
            key: "pacientes_activos",
            name: "Pacientes Activos",
            color: "#1d4ed8",
            icon: <Users className="w-4 h-4" />,
            category: "general"
        },
        {
            key: "hipertensos",
            name: "Pacientes Hipertensos",
            color: "#dc2626",
            icon: <HeartCrack className="w-4 h-4" />,
            category: "condicion"
        },
        {
            key: "diabeticos",
            name: "Pacientes Diabéticos",
            color: "#9333ea",
            icon: <CandyOff className="w-4 h-4" />,
            category: "condicion"
        },
        {
            key: "cateter_temporal",
            name: "Catéter Temporal",
            color: "#f59e0b",
            icon: <Activity className="w-4 h-4" />,
            category: "tratamiento"
        },
        {
            key: "inactivos",
            name: "Pacientes Inactivos",
            color: "#16a34a",
            icon: <UserMinus className="w-4 h-4" />,
            category: "estado"
        },
        {
            key: "criticos",
            name: "Pacientes Críticos",
            color: "#b91c1c",
            icon: <AlertTriangle className="w-4 h-4" />,
            category: "estado"
        },
        {
            key: "dialisis_peritoneal",
            name: "Diálisis Peritoneal",
            color: "#2563eb",
            icon: <BrainCog className="w-4 h-4" />,
            category: "tratamiento"
        },
        {
            key: "hemodialisis",
            name: "Hemodiálisis",
            color: "#0891b2",
            icon: <BrainCog className="w-4 h-4" />,
            category: "tratamiento"
        },
    ];

    const expandableKeys = ["pacientes_activos", "hipertensos", "diabeticos"];

    const getTrendInfo = (aumento_periodo: number, disminuyo_periodo?: number, key?: string) => {
        // Para pacientes activos, tenemos aumento y disminución separados
        if (key === "pacientes_activos") {
            const neto = (aumento_periodo || 0) - (disminuyo_periodo || 0);

            if (neto === 0)
                return {
                    text: "Sin cambio",
                    color: "text-gray-500",
                    icon: <Minus className="w-3 h-3" />,
                    neto: 0
                };

            return neto > 0
                ? {
                    text: `+${neto} pacientes`,
                    color: "text-green-500",
                    icon: <TrendingUp className="w-3 h-3" />,
                    neto: neto
                }
                : {
                    text: `${neto} pacientes`,
                    color: "text-red-500",
                    icon: <TrendingDown className="w-3 h-3" />,
                    neto: neto
                };
        }

        // Para otros indicadores, solo tenemos aumento
        if (aumento_periodo === 0)
            return {
                text: "Sin cambio",
                color: "text-gray-500",
                icon: <Minus className="w-3 h-3" />,
                neto: 0
            };

        return aumento_periodo > 0
            ? {
                text: `+${aumento_periodo}`,
                color: "text-green-500",
                icon: <TrendingUp className="w-3 h-3" />,
                neto: aumento_periodo
            }
            : {
                text: `${aumento_periodo}`,
                color: "text-red-500",
                icon: <TrendingDown className="w-3 h-3" />,
                neto: aumento_periodo
            };
    };

    const toggleExpand = (key: string) => {
        if (!expandableKeys.includes(key)) return;
        setExpandedCard(expandedCard === key ? null : key);
    };

    const formatDate = () => {
        return new Date().toLocaleDateString("es-ES", {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderExpandedContent = (indicatorKey: string, data: any) => {
        switch (indicatorKey) {
            case "diabeticos":
                return (
                    <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Detalles Demográficos
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                                <span className="text-gray-500">Hombres:</span>
                                <p className="font-semibold">{data.hombres || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Mujeres:</span>
                                <p className="font-semibold">{data.mujeres || 0}</p>
                            </div>
                            {data.edad_promedio !== null && (
                                <div>
                                    <span className="text-gray-500">Edad Promedio:</span>
                                    <p className="font-semibold">{data.edad_promedio} años</p>
                                </div>
                            )}
                        </div>

                        {/* Sección específica para tipos de diabetes */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Distribución por Tipo de Diabetes
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                <span className="text-gray-500 block mb-1">Diabetes Mellitus Tipo 1</span>
                                <p className="font-semibold text-purple-700 text-lg">
                                    {data.tipo1 || 0} pacientes
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {data.tipo1 ? ((data.tipo1 / data.total) * 100).toFixed(1) : 0}% del total
                                </p>
                            </div>
                            <div className="bg-violet-50 p-3 rounded-lg border border-violet-200">
                                <span className="text-gray-500 block mb-1">Diabetes Mellitus Tipo 2</span>
                                <p className="font-semibold text-violet-700 text-lg">
                                    {data.tipo2 || 0} pacientes
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {data.tipo2 ? ((data.tipo2 / data.total) * 100).toFixed(1) : 0}% del total
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "pacientes_activos":
                return (
                    <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Detalles Demográficos
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                                <span className="text-gray-500">Hombres:</span>
                                <p className="font-semibold">{data.hombres || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Mujeres:</span>
                                <p className="font-semibold">{data.mujeres || 0}</p>
                            </div>
                            {data.edad_promedio !== undefined && data.edad_promedio !== null && (
                                <div>
                                    <span className="text-gray-500">Edad Promedio:</span>
                                    <p className="font-semibold">{data.edad_promedio} años</p>
                                </div>
                            )}
                        </div>

                        {/* Cambios en el período */}
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Cambios en el Período
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <span className="text-gray-500 block mb-1">Nuevos Pacientes</span>
                                <p className="font-semibold text-green-700 text-lg">
                                    +{data.aumento_periodo || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ingresaron en el período
                                </p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <span className="text-gray-500 block mb-1">Pacientes Egresados</span>
                                <p className="font-semibold text-red-700 text-lg">
                                    {data.disminuyo_periodo || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Salieron en el período
                                </p>
                            </div>
                        </div>
                    </>
                );

            case "hipertensos":
            default:
                return (
                    <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Detalles Demográficos
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Hombres:</span>
                                <p className="font-semibold">{data.hombres || 0}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Mujeres:</span>
                                <p className="font-semibold">{data.mujeres || 0}</p>
                            </div>
                            {data.edad_promedio !== undefined && data.edad_promedio !== null && (
                                <div>
                                    <span className="text-gray-500">Edad Promedio:</span>
                                    <p className="font-semibold">{data.edad_promedio} años</p>
                                </div>
                            )}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Indicadores del Servicio de Nefrología
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Monitoreo en tiempo real del estado de los pacientes
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">
                            {periodo}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">Actualizado</p>
                    <p className="text-sm font-semibold text-gray-700">
                        {formatDate()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {indicators.map((indicator, index) => {
                    const data = stats[indicator.key];
                    if (!data) return null;

                    const percent = indicator.key === "pacientes_activos"
                        ? 100
                        : data.porcentaje || ((data.total / total) * 100).toFixed(1);

                    const trendInfo = getTrendInfo(
                        data.aumento_periodo || 0,
                        data.disminuyo_periodo,
                        indicator.key
                    );
                    const isExpanded = expandedCard === indicator.key;

                    return (
                        <motion.div
                            key={indicator.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`bg-white rounded-xl shadow-sm border-2 border-blue-200 hover:shadow-lg transition-all cursor-pointer ${isExpanded ? "col-span-2 row-span-2 border-blue-600" : ""
                                }`}
                            onClick={() => toggleExpand(indicator.key)}
                        >
                            <div className="p-4">
                                {/* Encabezado */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor: `${indicator.color}20`,
                                            }}
                                        >
                                            {React.cloneElement(indicator.icon, {
                                                style: { color: indicator.color }
                                            })}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                {indicator.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            {trendInfo.icon}
                                            <span className={`text-xs ${trendInfo.color}`}>
                                                {trendInfo.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Valor principal */}
                                <div className="mb-3">
                                    <div className="flex items-baseline justify-between">
                                        <p
                                            className="text-3xl font-bold"
                                            style={{ color: indicator.color }}
                                        >
                                            {data.total}
                                        </p>
                                    </div>
                                </div>

                                {/* Contenido expandido */}
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="mt-4 pt-4 border-t border-gray-200"
                                    >
                                        {renderExpandedContent(indicator.key, data)}
                                    </motion.div>
                                )}

                                {/* Pie de tarjeta */}
                                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                    {indicator.key !== "pacientes_activos" ? (
                                        <span>
                                            Representa el{" "}
                                            <strong>{percent}%</strong> del total
                                        </span>
                                    ) : (
                                        <span>Total de pacientes activos</span>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};