// pages/HomePage.tsx
import PatientCarousel from '@/components/custom/paciente/PatientCarousel'
import StatisticsChart from '@/components/custom/paciente/StatisticsChart'
import SpecialistPanel from '@/components/custom/SpecialistPanel'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Loader, RefreshCw } from 'lucide-react'

export const HomePage = () => {
    const { data, loading, error, refetch } = useDashboardData()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <div className="text-red-600 text-4xl mb-2">⚠️</div>
                        <h2 className="text-red-800 font-semibold mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Si no hay datos, mostrar página vacía sin errores
    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No hay datos disponibles</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <StatisticsChart
                statsData={data.stats}  // data ya no es null/undefined
                chartData={data.chart}
            />
            <SpecialistPanel
                specialist={data.specialist || null}
                events={data.events || []}
            />
            <PatientCarousel
                patients={data.patients || []}    // Array vacío si no hay pacientes
                patientsPerPage={3}
                showPagination={true}
                autoPlay={true}
                autoPlayInterval={7000}
                title="Últimos Pacientes"
                description="Lista completa"
            />
        </div>
    )
}