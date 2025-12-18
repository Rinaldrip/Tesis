// hooks/useDashboardStats.ts
import { useEffect, useState } from "react";
import { api } from "@/services/paciente.api";

export interface DashboardData {
  pacientes_activos: {
    total: number;
    edad_promedio: number;
    hombres: number;
    mujeres: number;
    aumento_3m: number;
    disminuyo_3m: number;
  };
  hipertensos: {
    total: number;
    edad_promedio: number;
    hombres: number;
    mujeres: number;
    aumento_3m: number;
    porcentaje: string;
  };
  diabeticos: {
    total: number;
    edad_promedio: number;
    hombres: number;
    mujeres: number;
    tipo1: number;
    tipo2: number;
    aumento_3m: number;
    porcentaje: string;
  };
  cateter_temporal: {
    total: number;
    aumento_3m: number;
    porcentaje: string;
  };
  inactivos: {
    total: number;
    aumento_3m: number;
    porcentaje: string;
  };
  criticos: {
    total: number;
    aumento_3m: number;
    porcentaje: string;
  };
  dialisis_peritoneal: {
    total: number;
    aumento_3m: number;
    porcentaje: string;
  };
  hemodialisis: {
    total: number;
    aumento_3m: number;
    porcentaje: string;
  };
}

export const useStatsView = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/reporte");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { data, loading };
};
