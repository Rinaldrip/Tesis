// components/custom/paciente/ChartVisual.tsx
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartVisualProps {
    chartData?: Array<{
        month: string;
        Hemodialisis: number;
        Peritonial: number;
    }>;
}

const chartConfig = {
    Hemodialisis: {
        label: "Hemodialisis",
        color: "#1e3a8a",
    },
    Peritonial: {
        label: "D. Peritonial",
        color: "#60a5fa",
    },
} satisfies ChartConfig

export function ChartVisual({ chartData = [] }: ChartVisualProps) {
    // Datos por defecto si no hay datos del backend
    const defaultData = [
        { month: "Enero", Hemodialisis: 0, Peritonial: 0 },
        { month: "Febrero", Hemodialisis: 0, Peritonial: 0 },
        { month: "Marzo", Hemodialisis: 0, Peritonial: 0 },
        { month: "Abril", Hemodialisis: 0, Peritonial: 0 },
        { month: "Mayo", Hemodialisis: 0, Peritonial: 0 },
        { month: "Junio", Hemodialisis: 0, Peritonial: 0 },
    ];

    const dataToUse = chartData.length > 0 ? chartData : defaultData;

    // Obtener el rango de meses para el subtítulo
    const getDateRange = () => {
        if (dataToUse.length === 0) return "Enero - Junio 2025";

        const firstMonth = dataToUse[0]?.month || "Enero";
        const lastMonth = dataToUse[dataToUse.length - 1]?.month || "Junio";
        const currentYear = new Date().getFullYear();

        return `${firstMonth} - ${lastMonth} ${currentYear}`;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Relación pacientes Hemodialisis y Dialisis Peritonial</CardTitle>
                <CardDescription>
                    {getDateRange()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-64 w-full">
                    <ChartContainer
                        config={chartConfig}
                        className="h-full w-full"
                    >
                        <BarChart
                            accessibilityLayer
                            data={dataToUse}
                            height={256}
                            margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
                            className="w-full"
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar
                                dataKey="Hemodialisis"
                                stackId="a"
                                fill="var(--color-Hemodialisis)"
                                radius={[0, 0, 4, 4]}
                            />
                            <Bar
                                dataKey="Peritonial"
                                stackId="a"
                                fill="var(--color-Peritonial)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Registro de los últimos {dataToUse.length} meses. <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>
    );
}