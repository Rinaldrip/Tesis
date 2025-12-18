import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
} from "recharts"

interface DatosDemograficosProps {
    distribucion_edad: Array<{ grupo: string; cantidad: number; porcentaje: number }>
    distribucion_sexo: Array<{ sexo: string; cantidad: number; porcentaje: number }>
    estadisticas_edad: {
        general: { media: number; mediana: number }
        hombres: { media: number; mediana: number }
        mujeres: { media: number; mediana: number }
    }
    composicion_etnica: Array<{ etnia: string; cantidad: number; porcentaje: number }>
}

export const DatosDemograficos = ({
    distribucion_edad,
    distribucion_sexo,
    estadisticas_edad,
    composicion_etnica
}: DatosDemograficosProps) => {

    // Transformar datos de distribución por edad
    const ageDistribution = distribucion_edad.map(item => ({
        age: item.grupo,
        count: item.cantidad,
        fill: getColorForAgeGroup(item.grupo)
    }))

    // Transformar datos de distribución por etnia
    const ethnicityDistribution = composicion_etnica.map(item => ({
        etnia: item.etnia,
        count: item.porcentaje, // Usar el porcentaje directamente para las barras
        fill: getColorForEthnicity(item.etnia)
    }))

    // Transformar datos para gráfico circular de género
    const genderPieData = distribucion_sexo.map(item => ({
        name: item.sexo,
        value: item.porcentaje, // Usar el porcentaje directamente
        fill: item.sexo === 'Hombre' ? "#3b82f6" : "#ec4899"
    }))

    // Función para obtener colores por grupo de edad
    function getColorForAgeGroup(grupo: string): string {
        const colors: { [key: string]: string } = {
            "0-18": "#60a5fa",
            "19-30": "#3b82f6",
            "31-45": "#2563eb",
            "46-60": "#1d4ed8",
            "61+": "#1e40af"
        }
        return colors[grupo] || "#6b7280"
    }

    // Función para obtener colores por etnia
    function getColorForEthnicity(etnia: string): string {
        const colors: { [key: string]: string } = {
            "Caucasico": "#4f46e5",
            "Afro": "#dc2626",
            "Asiatico": "#16a34a"
        }
        return colors[etnia] || "#6b7280"
    }

    console.log('Datos Demográficos Renderizados', genderPieData, ethnicityDistribution, ageDistribution);

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Datos Demográficos</h2>
                <p className="text-gray-600 mt-2">Distribución de pacientes por edad, género y etnia</p>
            </div>

            {/* Primera fila: Gráficos principales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución por edad - Gráfico de barras mejorado */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Distribución por Edad
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="age"
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value) => [`${value} pacientes`, 'Cantidad']}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                >
                                    {ageDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribución por género - Gráfico circular */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Distribución por Género
                    </h3>
                    <div className="h-72 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={genderPieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {genderPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Porcentaje']}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Segunda fila: Estadísticas y gráfico de barras horizontal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Estadísticas de edad */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                        Estadísticas de Edad
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-blue-800 text-sm uppercase tracking-wide mb-2">
                                General
                            </h4>
                            <div className="space-y-1">
                                <p className="text-gray-700 flex justify-between">
                                    <span>Media:</span>
                                    <span className="font-semibold text-blue-700">{estadisticas_edad.general.media} años</span>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span>Mediana:</span>
                                    <span className="font-semibold text-blue-700">{estadisticas_edad.general.mediana} años</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-indigo-700 text-sm uppercase tracking-wide mb-2">
                                Masculino
                            </h4>
                            <div className="space-y-1">
                                <p className="text-gray-700 flex justify-between">
                                    <span>Media:</span>
                                    <span className="font-semibold text-indigo-700">{estadisticas_edad.hombres.media} años</span>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span>Mediana:</span>
                                    <span className="font-semibold text-indigo-700">{estadisticas_edad.hombres.mediana} años</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-100 rounded-xl border border-pink-200">
                            <h4 className="font-semibold text-pink-700 text-sm uppercase tracking-wide mb-2">
                                Femenino
                            </h4>
                            <div className="space-y-1">
                                <p className="text-gray-700 flex justify-between">
                                    <span>Media:</span>
                                    <span className="font-semibold text-pink-700">{estadisticas_edad.mujeres.media} años</span>
                                </p>
                                <p className="text-gray-700 flex justify-between">
                                    <span>Mediana:</span>
                                    <span className="font-semibold text-pink-700">{estadisticas_edad.mujeres.mediana} años</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas detalladas de etnia */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        Composición Étnica
                    </h3>

                    <div className="space-y-5">
                        {ethnicityDistribution.map((etnia) => (
                            <div
                                key={etnia.etnia}
                                className="group relative p-4 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-1"
                                style={{
                                    borderColor: etnia.fill,
                                    background: `linear-gradient(to right, ${etnia.fill}10, ${etnia.fill}05)`,
                                }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: etnia.fill }}
                                        ></span>
                                        <h4
                                            className="font-semibold text-sm uppercase tracking-wide"
                                            style={{ color: etnia.fill }}
                                        >
                                            {etnia.etnia}
                                        </h4>
                                    </div>
                                    <span
                                        className="font-bold text-lg transition-colors duration-300"
                                        style={{ color: etnia.fill }}
                                    >
                                        {etnia.count}%
                                    </span>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-3 rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: `${etnia.count}%`,
                                            background: `linear-gradient(90deg, ${etnia.fill}, ${etnia.fill}cc)`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}