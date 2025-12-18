export interface ViewStatsData {
  success: boolean;
  lastUpdate: string;
  stats: Record<string, Stat>;
}

export interface Stat {
  value: number; // valor calculado por SQL
  trend?: number; // cambio porcentual, ya calculado en backend
  current?: boolean;
  lastUpdate?: string;
  target?: number;
  details?: {
    male?: number;
    female?: number;
    averageAge?: number;
    tipo1?: number;
    tipo2?: number;
  };
}
