'use client';

import { motion } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { formatDate } from '@/helpers/formatDate';
import type { LabResult, LabIndicator } from '@/types/patientStats';

interface ChartsGridProps {
    labResults: LabResult[];
    indicators: LabIndicator[];
}

interface ChartDataPoint {
    fecha: string;
    valor: number | null;
    formattedDate: string;
    formatFecha: string;
}

// Componente para manejar el renderizado del chart
function ChartWrapper({ indicator, chartData }: { indicator: LabIndicator; chartData: ChartDataPoint[] }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Cargando gráfico...
            </div>
        );
    }

    return (
        <>
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                    <defs>
                        <linearGradient id={`gradient-${indicator.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={indicator.color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={indicator.color} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload?.length) {
                                const { formatFecha, valor } = payload[0].payload;
                                const status = getValueStatus(valor, indicator);
                                const color = getStatusColor(status);

                                return (
                                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                        <p className="text-sm font-medium text-gray-800">{formatFecha}</p>
                                        <p className="text-sm text-gray-600">
                                            Valor:{' '}
                                            <span className="font-semibold text-gray-800">
                                                {valor !== null ? valor.toFixed(2) : 'N/A'} {indicator.unit || ''}
                                            </span>
                                        </p>
                                        {valor !== null && (
                                            <p className={`text-xs ${color}`}>{status}</p>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    {/* Líneas del rango normal */}
                    <ReferenceLine
                        y={indicator.normalRange.min}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                    />
                    <ReferenceLine
                        y={indicator.normalRange.max}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                    />

                    {/* Área principal */}
                    <Area
                        type="monotone"
                        dataKey="valor"
                        stroke={indicator.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${indicator.key})`}
                        connectNulls
                        dot={{ fill: indicator.color, r: 3 }}
                        activeDot={{ r: 6, stroke: indicator.color, strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Información simplificada - solo muestra cantidad de muestras */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                <span>Muestras: {chartData.length}</span>
            </div>
        </>
    );
}

// Helper functions
const getValueStatus = (value: number, indicator: LabIndicator) => {
    if (value < indicator.normalRange.min) return 'Bajo';
    if (value > indicator.normalRange.max) return 'Alto';
    return 'Normal';
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Bajo':
            return 'text-red-600';
        case 'Alto':
            return 'text-orange-600';
        default:
            return 'text-green-600';
    }
};

export function ChartsGrid({ labResults, indicators }: ChartsGridProps) {
    // === Helper: genera los datos para cada gráfico ===
    const prepareChartData = (indicator: LabIndicator): ChartDataPoint[] =>
        labResults
            .filter((r) => r[indicator.key] != null)
            .map((r) => ({
                fecha: r.fecha,
                valor: Number(r[indicator.key]),
                formatFecha: formatDate(r.fecha),
                formattedDate: format(new Date(r.fecha), 'dd MMM', { locale: es }),
            }))
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    if (!labResults?.length) {
        return (
            <div className="bg-white rounded-xl shadow-md p-10 text-center border border-gray-100">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No hay datos de laboratorio disponibles
                </h3>
                <p className="text-gray-500 text-sm">
                    No se encontraron resultados históricos para este paciente.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {indicators.map((indicator, index) => {
                const chartData = useMemo(() => prepareChartData(indicator), [labResults, indicator]);

                if (chartData.length === 0) {
                    return (
                        <motion.div
                            key={indicator.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{indicator.name}</h3>
                                    <p className="text-sm text-gray-500">No hay datos disponibles</p>
                                </div>
                                <Activity className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                                No se registraron resultados
                            </div>
                        </motion.div>
                    );
                }

                return (
                    <motion.div
                        key={indicator.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-md p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">{indicator.name}</h3>
                                <p className="text-sm text-gray-500">
                                    Rango normal: {indicator.normalRange.min} – {indicator.normalRange.max}{' '}
                                    {indicator.unit || ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: indicator.color }}
                                />
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <ChartWrapper indicator={indicator} chartData={chartData} />
                    </motion.div>
                );
            })}
        </div>
    );
}