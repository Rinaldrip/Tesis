export interface Patient {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    fecha_nacimiento?: string;
    estado: string;
    fecha_ingreso?: string;
    tipo?: string;
    fecha_realizada?: string;
    tipo_dialisis?: string;
    etiologia_enfermedad_renal?: string;
    hipertension_arterial?: boolean;
}

export interface LabResult {
    id: number;
    cedula_paciente: bigint;
    fecha: string;
    hb: number | null;
    hto: number | null;
    glicemia: number | null;
    urea: number | null;
    creatinina: number | null;
    albumina: number | null;
    ca: number | null;
    p: number | null;
}


export interface LabIndicator {
    name: string;
    key: keyof Pick<LabResult, 'hb' | 'hto' | 'glicemia' | 'urea' | 'creatinina' | 'albumina' | 'ca' | 'p'>;
    unit:string;
    normalRange: { min: number; max: number };
    color: string;
}

export interface LabStats {
    current: number;    // Valor actual (más reciente)
    average: number;    // Promedio
    min: number;        // Mínimo
    max: number;        // Máximo
    trend: number;      // Tendencia
}
export interface TreatmentEvent {
    id: number;
    cedula_paciente: string;
    fecha: string;
    tratamiento: string;
}

export type DateRangeFilter = '3meses' | '6meses' | 'anual' | 'todo';
