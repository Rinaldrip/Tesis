"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { ChartConfig } from "@/components/ui/chart"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

// Interface para los datos del laboratorio
interface LaboratorioData {
    promedio: number
    total_muestras: number
    desviacion_estandar: number
    unidad: string
    rango_referencia: string
    estabilidad: string
    datos_historicos: { month: string; value: number }[]
}

interface DatosClinicosProps {
    hemoglobina: LaboratorioData
    hematocrito: LaboratorioData
    glicemia: LaboratorioData
    urea: LaboratorioData
    creatinina: LaboratorioData
    albumina: LaboratorioData
    calcio: LaboratorioData
    fosforo: LaboratorioData
}

// 🔹 Función para obtener el icono de tendencia basado en la estabilidad
function getTrendIcon(estabilidad: string) {
    const iconProps = { className: "h-4 w-4" }

    switch (estabilidad) {
        case "Muy Estable":
        case "Estable":
            return <TrendingUp {...iconProps} className="text-green-500" />
        case "Moderadamente Variable":
            return <Minus {...iconProps} className="text-yellow-500" />
        case "Variable":
            return <TrendingDown {...iconProps} className="text-red-500" />
        default:
            return <Minus {...iconProps} className="text-gray-500" />
    }
}

// 🔹 Función para obtener el texto de tendencia
function getTrendText(estabilidad: string) {
    switch (estabilidad) {
        case "Muy Estable":
            return "Muy estable en el último semestre"
        case "Estable":
            return "Estable en el último semestre"
        case "Moderadamente Variable":
            return "Variación moderada en el último semestre"
        case "Variable":
            return "Alta variabilidad en el último semestre"
        default:
            return "Sin datos de tendencia"
    }
}

// 🔹 Tarjeta individual de laboratorio
function LabChartCard({
    title,
    data,
    color,
    unidad,
    rangoReferencia,
    estabilidad,
    promedioReal,
    totalMuestras
}: {
    title: string
    data: { month: string; value: number }[]
    color: string
    unidad: string
    rangoReferencia: string
    estabilidad: string
    promedioReal: number
    totalMuestras: number
}) {
    const chartConfig = {
        value: {
            label: title,
            color,
        },
    } satisfies ChartConfig

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <CardDescription>
                    {unidad} | Ref: {rangoReferencia} | Promedio: {promedioReal.toFixed(2)} {unidad}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <AreaChart data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent />}
                            formatter={(value) => [`${Number(value).toFixed(2)} ${unidad}`, title]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fill={color}
                            fillOpacity={0.25}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4 }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                    {getTrendIcon(estabilidad)}
                    {getTrendText(estabilidad)} | {totalMuestras} muestras
                </div>
            </CardFooter>
        </Card>
    )
}

// 🔹 Dashboard con 2 gráficos por fila
export function DatosClinicos({
    hemoglobina,
    hematocrito,
    glicemia,
    urea,
    creatinina,
    albumina,
    calcio,
    fosforo
}: DatosClinicosProps) {

    // Colores para cada parámetro
    const colors = {
        hemoglobina: "#ef4444",
        hematocrito: "#f97316",
        glicemia: "#3b82f6",
        urea: "#06b6d4",
        creatinina: "#10b981",
        albumina: "#8b5cf6",
        calcio: "#facc15",
        fosforo: "#ec4899"
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabChartCard
                title="Hemoglobina"
                data={hemoglobina.datos_historicos}
                color={colors.hemoglobina}
                unidad={hemoglobina.unidad}
                rangoReferencia={hemoglobina.rango_referencia}
                estabilidad={hemoglobina.estabilidad}
                promedioReal={hemoglobina.promedio}
                totalMuestras={hemoglobina.total_muestras}
            />
            <LabChartCard
                title="Hematocrito"
                data={hematocrito.datos_historicos}
                color={colors.hematocrito}
                unidad={hematocrito.unidad}
                rangoReferencia={hematocrito.rango_referencia}
                estabilidad={hematocrito.estabilidad}
                promedioReal={hematocrito.promedio}
                totalMuestras={hematocrito.total_muestras}
            />
            <LabChartCard
                title="Glicemia"
                data={glicemia.datos_historicos}
                color={colors.glicemia}
                unidad={glicemia.unidad}
                rangoReferencia={glicemia.rango_referencia}
                estabilidad={glicemia.estabilidad}
                promedioReal={glicemia.promedio}
                totalMuestras={glicemia.total_muestras}
            />
            <LabChartCard
                title="Urea"
                data={urea.datos_historicos}
                color={colors.urea}
                unidad={urea.unidad}
                rangoReferencia={urea.rango_referencia}
                estabilidad={urea.estabilidad}
                promedioReal={urea.promedio}
                totalMuestras={urea.total_muestras}
            />
            <LabChartCard
                title="Creatinina"
                data={creatinina.datos_historicos}
                color={colors.creatinina}
                unidad={creatinina.unidad}
                rangoReferencia={creatinina.rango_referencia}
                estabilidad={creatinina.estabilidad}
                promedioReal={creatinina.promedio}
                totalMuestras={creatinina.total_muestras}
            />
            <LabChartCard
                title="Albúmina"
                data={albumina.datos_historicos}
                color={colors.albumina}
                unidad={albumina.unidad}
                rangoReferencia={albumina.rango_referencia}
                estabilidad={albumina.estabilidad}
                promedioReal={albumina.promedio}
                totalMuestras={albumina.total_muestras}
            />
            <LabChartCard
                title="Calcio"
                data={calcio.datos_historicos}
                color={colors.calcio}
                unidad={calcio.unidad}
                rangoReferencia={calcio.rango_referencia}
                estabilidad={calcio.estabilidad}
                promedioReal={calcio.promedio}
                totalMuestras={calcio.total_muestras}
            />
            <LabChartCard
                title="Fósforo"
                data={fosforo.datos_historicos}
                color={colors.fosforo}
                unidad={fosforo.unidad}
                rangoReferencia={fosforo.rango_referencia}
                estabilidad={fosforo.estabilidad}
                promedioReal={fosforo.promedio}
                totalMuestras={fosforo.total_muestras}
            />
        </div>
    )
}