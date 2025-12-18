"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { ViewStats } from "./viewStats";
import { BarChart3, Users, HeartPulse } from "lucide-react";
import { ResumenGeneral } from "./ResumenGeneral";
import { DatosDemograficos } from "./DatosDemograficos";
import { DatosClinicos } from "./DatosClinicos";
import { FiltersPanel } from "../FiltersPanel";
import { api } from "@/services/paciente.api";
import type { DateRangeFilter } from "@/types/patientStats";
import ButtonExcel from "./buttonExcel";

// Tipos específicos basados en tu JSON REAL
interface StatsData {
    [key: string]: any;
}

interface ResumenData {
    success?: boolean;
    periodo?: string;
    pacientes_activos?: Array<{ mes: string; cantidad: string }>;
    estados_clinicos?: Array<{ estado: string; cantidad: string }>;
    tipo_dialisis?: Array<{ tipo_dialisis: string; cantidad: string }>;
    accesos_vasculares?: Array<{ tipo: string; cantidad: string }>;
}

interface DemograficosData {
    success?: boolean;
    distribucion_edad?: Array<{ grupo: string; cantidad: number; porcentaje: number }>;
    distribucion_sexo?: Array<{ sexo: string; cantidad: number; porcentaje: number }>;
    estadisticas_edad?: {
        general: { media: number; mediana: number };
        hombres: { media: number; mediana: number };
        mujeres: { media: number; mediana: number };
    };
    composicion_etnica?: Array<{ etnia: string; cantidad: number; porcentaje: number }>;
}

interface LaboratorioData {
    promedio: number;
    total_muestras: number;
    desviacion_estandar: number;
    unidad: string;
    rango_referencia: string;
    estabilidad: string;
    datos_historicos: Array<{ month: string; value: number }>;
}

interface ClinicosData {
    success?: boolean;
    periodo?: string;
    hemoglobina?: LaboratorioData;
    hematocrito?: LaboratorioData;
    glicemia?: LaboratorioData;
    urea?: LaboratorioData;
    creatinina?: LaboratorioData;
    albumina?: LaboratorioData;
    calcio?: LaboratorioData;
    fosforo?: LaboratorioData;
}

// Función para convertir filtro a parámetro de rango (igual que en el ejemplo)
const getRangeParam = (filter: DateRangeFilter): string => {
    const filterToRangeMap = {
        '3meses': '3meses',
        '6meses': '6meses',
        'anual': '12meses',
        'todo': 'todo'
    };

    return filterToRangeMap[filter] || '3meses';
};

export const ReportGeneral = () => {
    const [statsData, setStatsData] = useState<StatsData | null>(null);
    const [statsResumen, setStatsResumen] = useState<ResumenData | null>(null);
    const [statsDemograficos, setStatsDemograficos] = useState<DemograficosData | null>(null);
    const [statsClinicos, setStatsClinicos] = useState<ClinicosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>("3meses");
    const [refreshing, setRefreshing] = useState(false);

    // Función para cargar datos con el rango seleccionado
    const fetchStats = async (filter: DateRangeFilter = dateFilter) => {
        try {
            setError(null);
            if (!refreshing) setLoading(true);

            const rangeParam = getRangeParam(filter);

            console.log(`📊 Cargando datos con rango: ${rangeParam}`);

            // Ejecutar todas las peticiones en paralelo con parámetro en la URL
            const [responseView, responseResumen, responseDemograficos, responseClinicos] = await Promise.all([
                api.get(`/reporte/viewStats/${rangeParam}`),
                api.get(`/reporte/ReporteGeneral/${rangeParam}`),
                api.get("/reporte/datosDemograficos"),
                api.get(`/reporte/DatosClinicos/${rangeParam}`)
            ]);

            const payload = responseView.data?.data || responseView.data || {};
            const payloadResumen = responseResumen.data?.data || responseResumen.data || {};
            const payloadDemograficos = responseDemograficos.data?.data || responseDemograficos.data || {};
            const payloadClinicos = responseClinicos.data?.data || responseClinicos.data || {};

            console.log(`✅ Datos cargados con rango: ${rangeParam}`, {
                viewStats: payload,
                resumen: payloadResumen,
                demograficos: payloadDemograficos,
                clinicos: payloadClinicos
            });

            setStatsData(payload);
            setStatsResumen(payloadResumen);
            setStatsDemograficos(payloadDemograficos);
            setStatsClinicos(payloadClinicos);

        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            setError("No se pudieron cargar las estadísticas");
            setStatsData({});
            setStatsResumen({});
            setStatsDemograficos({});
            setStatsClinicos({});
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Manejar cambio de filtro
    const handleFilterChange = async (filter: DateRangeFilter) => {
        setDateFilter(filter);
        setRefreshing(true);
        await fetchStats(filter);
    };

    // Calcular total de resultados (puedes ajustar esta lógica según tus necesidades)
    const getTotalResults = () => {
        if (!statsResumen) return 0;

        const pacientesActivos = statsResumen.pacientes_activos?.reduce((sum, item) =>
            sum + parseInt(item.cantidad), 0) || 0;

        return pacientesActivos;
    };

    // Estado de carga mejorado
    if (loading && !refreshing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="container mx-auto p-6 space-y-8">
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                        Dashboard de Nefrología
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Monitoreo integral y análisis de datos del servicio de nefrología
                    </p>
                </div>

                {/* Panel de Filtros */}
                <FiltersPanel
                    selectedFilter={dateFilter}
                    onFilterChange={handleFilterChange}
                    totalResults={getTotalResults()}
                    isLoading={refreshing}
                />

                {/* Mensaje de error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Stats Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <ViewStats stats={statsData || {}} />
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <Tabs defaultValue="resumen" className="w-full">
                        <div className="border-b border-gray-200">
                            <TabsList className="flex flex-wrap justify-center items-center gap-6 p-4 bg-gray-50/50">
                                <TabsTrigger
                                    value="resumen"
                                    className="flex items-center gap-2 py-3 px-5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 data-[state=active]:font-semibold text-gray-600 hover:bg-white/80"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Resumen General
                                </TabsTrigger>

                                <TabsTrigger
                                    value="demographics"
                                    className="flex items-center gap-2 py-3 px-5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 data-[state=active]:font-semibold text-gray-600 hover:bg-white/80"
                                >
                                    <Users className="w-4 h-4" />
                                    Demografía
                                </TabsTrigger>

                                <TabsTrigger
                                    value="clinical"
                                    className="flex items-center gap-2 py-3 px-5 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 data-[state=active]:font-semibold text-gray-600 hover:bg-white/80"
                                >
                                    <HeartPulse className="w-4 h-4" />
                                    Datos Clínicos
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab Contents */}
                        <div className="p-6">
                            <TabsContent value="resumen" className="space-y-6 m-0">
                                {!loading && statsResumen && (
                                    <ResumenGeneral
                                        pacientes_activos={statsResumen.pacientes_activos || []}
                                        estados_clinicos={statsResumen.estados_clinicos || []}
                                        tipo_dialisis={statsResumen.tipo_dialisis || []}
                                        accesos_vasculares={statsResumen.accesos_vasculares || []}
                                        periodo={statsResumen.periodo || "Período no disponible"}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="demographics" className="space-y-6 m-0">
                                {!loading && statsDemograficos && (
                                    <DatosDemograficos
                                        distribucion_edad={statsDemograficos.distribucion_edad || []}
                                        distribucion_sexo={statsDemograficos.distribucion_sexo || []}
                                        estadisticas_edad={statsDemograficos.estadisticas_edad || {
                                            general: { media: 0, mediana: 0 },
                                            hombres: { media: 0, mediana: 0 },
                                            mujeres: { media: 0, mediana: 0 }
                                        }}
                                        composicion_etnica={statsDemograficos.composicion_etnica || []}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="clinical" className="space-y-6 m-0">
                                {!loading && statsClinicos && (
                                    <DatosClinicos
                                        hemoglobina={statsClinicos.hemoglobina!}
                                        hematocrito={statsClinicos.hematocrito!}
                                        glicemia={statsClinicos.glicemia!}
                                        urea={statsClinicos.urea!}
                                        creatinina={statsClinicos.creatinina!}
                                        albumina={statsClinicos.albumina!}
                                        calcio={statsClinicos.calcio!}
                                        fosforo={statsClinicos.fosforo!}
                                    />
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                    <div>
                        <ButtonExcel
                            position="bottom-right"
                            buttonText="Exportar a Excel"
                            size="lg"
                            borderRadius="full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};