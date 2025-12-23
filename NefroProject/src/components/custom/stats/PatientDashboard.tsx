import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import type {
    Patient,
    LabResult,
    LabIndicator,
    LabStats,
    DateRangeFilter,
} from "@/types/patientStats";
import { StatsOverview } from "@/components/custom/stats/StatsOverview";
import { ChartsGrid } from "@/components/custom/stats/ChartGrid";
import { FiltersPanel } from "@/components/custom/FiltersPanel";
import { api } from "@/services/paciente.api";
import PatientHeader from "../paciente/HeaderInfo";

// --- Indicators Definition ---
const LAB_INDICATORS: LabIndicator[] = [
    { name: "Hemoglobina (HB)", key: "hb", unit: "g/dL", normalRange: { min: 12, max: 16 }, color: "#3b82f6" },
    { name: "Hematocrito (HTO)", key: "hto", unit: "%", normalRange: { min: 36, max: 48 }, color: "#8b5cf6" },
    { name: "Glicemia", key: "glicemia", unit: "mg/dL", normalRange: { min: 70, max: 110 }, color: "#10b981" },
    { name: "Urea", key: "urea", unit: "mg/dL", normalRange: { min: 15, max: 45 }, color: "#f59e0b" },
    { name: "Creatinina", key: "creatinina", unit: "mg/dL", normalRange: { min: 0.7, max: 1.3 }, color: "#ef4444" },
    { name: "Albumina", key: "albumina", unit: "g/dL", normalRange: { min: 3.5, max: 5.5 }, color: "#06b6d4" },
    { name: "Calcio (Ca)", key: "ca", unit: "mg/dL", normalRange: { min: 8.5, max: 10.5 }, color: "#84cc16" },
    { name: "Fósforo (P)", key: "p", unit: "mg/dL", normalRange: { min: 2.5, max: 4.5 }, color: "#ec4899" },
];

interface PatientDashboardProps {
    patientId: string;
}

// Función para mapear dateFilter a range del backend
const getRangeParam = (filter: DateRangeFilter): string => {
    const filterToRangeMap = {
        '3meses': '3meses',
        '6meses': '6meses',
        'anual': '1año',
        'todo': 'todo'
    };

    return filterToRangeMap[filter] || '3meses';
};

export function PatientDashboard({ patientId }: PatientDashboardProps) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [labResults, setLabResults] = useState<LabResult[]>([]);
    const [labStats, setLabStats] = useState<Record<string, LabStats>>({});
    const [dateFilter, setDateFilter] = useState<DateRangeFilter>("3meses");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos del paciente solo una vez
    const fetchPatientData = async () => {
        try {
            // Validar que patientId sea un número válido
            if (!patientId || isNaN(Number(patientId))) {
                throw new Error(`ID de paciente inválido: ${patientId}`);
            }

            const cedula = BigInt(patientId);

            console.log(`👤 Fetching patient data for: ${cedula}`);

            const patientResponse = await api.get(`/pacientes/header/${cedula}`);

            // Procesar datos del paciente
            if (patientResponse.data.success && patientResponse.data.patientData) {
                setPatient(patientResponse.data.patientData);
            } else {
                setPatient(patientResponse.data);
            }

        } catch (err) {
            console.error('❌ Error fetching patient data:', err);
            throw err;
        }
    };

    // Cargar datos de laboratorios y estadísticas (se ejecuta cuando cambia dateFilter)
    const fetchLabData = async (rangeParam: string) => {
        try {
            if (!patientId || isNaN(Number(patientId))) {
                throw new Error(`ID de paciente inválido: ${patientId}`);
            }

            const cedula = BigInt(patientId);

            const [labsDataResponse, labsStatsResponse] = await Promise.all([
                api.get(`/pacientes/stats/${cedula}/${rangeParam}`),
                api.get(`/pacientes/stats/avg/${cedula}/${rangeParam}`)
            ]);

            console.log('✅ Lab responses received:', {
                labs: labsDataResponse.data,
                stats: labsStatsResponse.data
            });

            // Procesar datos de laboratorios
            setLabResults(labsDataResponse.data?.data || labsDataResponse.data || []);

            // Procesar estadísticas
            setLabStats(labsStatsResponse.data?.stats || labsStatsResponse.data || {});

        } catch (err) {
            console.error('❌ Error fetching lab data:', err);
            throw err;
        }
    };

    // Cargar todos los datos iniciales
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setError(null);

            const rangeParam = getRangeParam(dateFilter);

            // Cargar datos del paciente y datos de laboratorios en paralelo
            await Promise.all([
                fetchPatientData(),
                fetchLabData(rangeParam)
            ]);

        } catch (err) {
            console.error('❌ Error fetching initial data:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar los datos del paciente');
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar datos iniciales solo cuando cambia patientId
    useEffect(() => {
        fetchInitialData();
    }, [patientId]); // Solo depende de patientId

    // Efecto separado para cargar solo datos de laboratorios cuando cambia dateFilter
    useEffect(() => {
        if (patientId && !isNaN(Number(patientId))) {
            const rangeParam = getRangeParam(dateFilter);
            fetchLabData(rangeParam);
        }
    }, [dateFilter]); // Solo depende de dateFilter

    // Función para reintentar
    const handleRetry = () => {
        fetchInitialData();
    };

    console.log(labResults);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando datos del paciente...</p>
                </motion.div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center"
                >
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
                    <p className="text-gray-600 mb-4">{error || 'Paciente no encontrado'}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </motion.div>
            </div>
        );
    }

    const hasData = labResults.length > 0 && Object.keys(labStats).length > 0;

    return (
        // Agregué w-full aquí para asegurar que el contenedor padre ocupe todo el ancho
        <div className="min-h-screen w-full bg-gradient-to-br from-white/50 to-gray-100 p-6">

            {/* CAMBIO CLAVE: Cambié 'max-w-7xl mx-auto' por 'w-full h-full' */}
            <div className="w-full h-full">

                {/* Usar PatientHeader en lugar del header temporal */}
                {patient && <PatientHeader patientData={patient} />}

                <FiltersPanel selectedFilter={dateFilter} onFilterChange={setDateFilter} />

                {hasData ? (
                    <>
                        <StatsOverview indicators={LAB_INDICATORS} stats={labStats} />
                        <ChartsGrid labResults={labResults} indicators={LAB_INDICATORS} />
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg shadow-md p-8 text-center"
                    >
                        <p className="text-gray-600 mb-4">
                            No hay resultados de laboratorio disponibles para el período seleccionado.
                        </p>
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Recargar datos
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}