import {
    Pie,
    PieChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Legend,
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

export const description = "Dashboard de datos clínicos"

// Leyenda personalizada
const CustomLegend = ({ payload }: any) => {
    if (!payload) return null
    return (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
            {payload.map((entry: any, index: number) => (
                <div key={`item-${index}`} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color || entry.payload.fill }}
                    />
                    <span className="text-sm">
                        {entry.value ||
                            entry.dataKey ||
                            entry.payload.estado ||
                            entry.payload.tipo_dialisis ||
                            entry.payload.tipo}
                    </span>
                </div>
            ))}
        </div>
    )
}

interface ResumenGeneralProps {
    pacientes_activos: Array<{ mes: string; cantidad: string }>
    estados_clinicos: Array<{ estado: string; cantidad: string }>
    tipo_dialisis: Array<{ tipo_dialisis: string; cantidad: string }>
    accesos_vasculares: Array<{ tipo: string; cantidad: string }>
    periodo: string
}

export function ResumenGeneral({
    pacientes_activos,
    estados_clinicos,
    tipo_dialisis,
    accesos_vasculares,
    periodo
}: ResumenGeneralProps) {

    // Transformar datos para pacientes activos (gráfico de barras)
    const transformedPacientesData = pacientes_activos.map(item => ({
        month: item.mes,
        pacientes: parseInt(item.cantidad)
    }))

    // Transformar datos para estado de pacientes (gráfico de barras vertical)
    const transformedEstadoData = estados_clinicos.map((item, index) => {
        const colors = ["#B71C1C", "#43A047", "#d69e2e",]
        return {
            estado: item.estado,
            pacientes: parseInt(item.cantidad),
            fill: colors[index] || "#3b82f6"
        }
    })

    // Transformar datos para tipos de diálisis (gráfico circular)
    const transformedDialisisData = tipo_dialisis.map((item, index) => {
        const colors = ["#40E0D0", "#3b82f6"]
        return {
            dialisis: item.tipo_dialisis,
            pacientes: parseInt(item.cantidad),
            fill: colors[index] || "#3b82f6"
        }
    })

    // Transformar datos para accesos vasculares (gráfico circular)
    const transformedAccesoData = accesos_vasculares.map((item, index) => {
        const colors = ["#22c55e", "#eab308", "#ef4444"]
        // Mapear tipos a nombres más legibles
        const tipoNames: Record<string, string> = {
            "cateter-per": "Catéter Permacath",
            "cateter-tem": "Catéter Temporal",
            "fistula": "Fístula AV"
        }
        return {
            acceso: tipoNames[item.tipo] || item.tipo,
            pacientes: parseInt(item.cantidad),
            fill: colors[index] || "#3b82f6"
        }
    })

    // Configuraciones
    const pacientesConfig = {
        pacientes: {
            label: "Pacientes Nuevos ",
            color: "#3b82f6",
        },
    } satisfies ChartConfig

    const estadoPacientesConfig = {
        pacientes: { label: "Pacientes" },
        estable: { label: "Estable", color: "#43A047" },
        mejorando: { label: "Mejorando", color: "#d69e2e" },
        critico: { label: "Crítico", color: "#B71C1C" },
    } satisfies ChartConfig

    return (
        <div className="space-y-6 p-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Resumen General</h2>
                <p className="text-gray-600 mt-2">Revisión General de Métricas Generales</p>
            </div>
            {/* Fila 1: Gráficos de barras */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pacientes Activos */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Pacientes Nuevos</CardTitle>
                        <CardDescription className="text-xs">{periodo}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer config={pacientesConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={transformedPacientesData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        tickMargin={8}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 3)}
                                        fontSize={12}
                                    />
                                    <YAxis hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar
                                        dataKey="pacientes"
                                        fill="#3b82f6"
                                        radius={4}
                                        barSize={32}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Estado de Pacientes */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Estado de Pacientes</CardTitle>
                        <CardDescription className="text-xs">Situación actual</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer config={estadoPacientesConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={transformedEstadoData}
                                    layout="vertical"
                                    margin={{ left: 20, right: 10 }}
                                >
                                    <YAxis
                                        dataKey="estado"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        fontSize={12}
                                        width={80}
                                    />
                                    <XAxis dataKey="pacientes" type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="pacientes" radius={5} />
                                    <Legend content={<CustomLegend />} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Fila 2: Gráficos circulares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipos de Diálisis */}
                <Card>
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-center">Tipos de Diálisis</CardTitle>
                        <CardDescription className="text-center">{periodo}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer
                            config={estadoPacientesConfig}
                            className="h-full w-full flex items-center justify-center"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={transformedDialisisData}
                                        dataKey="pacientes"
                                        nameKey="dialisis"
                                        stroke="0"
                                        innerRadius={50}
                                        outerRadius={100}
                                    />
                                    <Legend content={<CustomLegend />} verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Accesos Vasculares */}
                <Card>
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="text-center">Accesos Vasculares</CardTitle>
                        <CardDescription className="text-center">{periodo}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ChartContainer
                            config={estadoPacientesConfig}
                            className="h-full w-full flex items-center justify-center"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={transformedAccesoData}
                                        dataKey="pacientes"
                                        nameKey="acceso"
                                        stroke="0"
                                        innerRadius={50}
                                        outerRadius={100}
                                    />
                                    <Legend content={<CustomLegend />} verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}