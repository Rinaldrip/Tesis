// components/custom/paciente/StatisticsChart.tsx
import React from 'react';
import { Users, Calendar, AlertTriangleIcon, HeartCrackIcon } from 'lucide-react';
import { ChartVisual } from '../ChartVisual';

type TrendType = 'up' | 'down';
type StatColor = 'blue' | 'teal' | 'red' | 'green';

interface StatItem {
  title: string;
  value: string;
  change?: string;
  trend?: TrendType;
  icon: React.ComponentType<any>;
  color: StatColor;
}

interface StatisticsChartProps {
  statsData?: {
    pacientesActivos: number;
    proximosEventos: number;
    casosCriticos: number;
    pacientesHipertensos: number;
  };
  chartData?: Array<{
    month: string;
    Hemodialisis: number;
    Peritonial: number;
  }>;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  statsData,
  chartData
}) => {
  // Si no hay statsData, no renderizar nada
  if (!statsData) {
    return null;
  }

  // Estructura estática de las cards con valores dinámicos
  const stats: StatItem[] = [
    {
      title: 'Pacientes Activos',
      value: statsData.pacientesActivos?.toString() || '0',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Próximos Eventos',
      value: statsData.proximosEventos?.toString() || '0',
      icon: Calendar,
      color: 'teal'
    },
    {
      title: 'Casos Críticos',
      value: statsData.casosCriticos?.toString() || '0',
      trend: 'down' as TrendType,
      icon: AlertTriangleIcon,
      color: 'red'
    },
    {
      title: 'Pacientes Hipertensos',
      value: statsData.pacientesHipertensos?.toString() || '0',
      icon: HeartCrackIcon,
      color: 'red'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Estadísticas de Pacientes</h2>
        <p className="text-gray-600">Visión general de las métricas de atención al paciente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'teal' ? 'bg-teal-100' :
                    stat.color === 'red' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                  <Icon className={`w-4 h-4 ${stat.color === 'blue' ? 'text-blue-900' :
                    stat.color === 'teal' ? 'text-teal-600' :
                      stat.color === 'red' ? 'text-red-600' : 'text-green-600'
                    }`} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Gráfico - Solo si hay chartData */}
      {chartData && chartData.length > 0 && (
        <ChartVisual chartData={chartData} />
      )}
    </div>
  );
};

export default StatisticsChart;