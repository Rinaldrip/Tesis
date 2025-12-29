export interface PatientData {
  // Información Personal (estructura anidada)
  paciente: {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono?: string;
    fecha_nacimiento?: string;
    lugar_nacimiento?: string;  
    direccion?: string;
    estado?:string;
    sexo?:boolean;
    etnia?: string;
  };

  // Contacto de Emergencia (estructura anidada)
  contactosEmergencia: {
    length: number;
    nombre: string;
    telefono: string;
    parentesco: string;
  };

  // Datos clínicos (estructura anidada)
  datosIngreso?: {
    fecha_ingreso?: string;
    fecha_egreso?: string | "N/A";
    etiologia_enfermedad_renal?: string;
    causa_egreso?: string;           
    peso_ingreso_kg?: number; 
    talla_cm?: number;               
    volumen_residual_cc?: number;    
  };

  // Datos médicos (estructura anidada)
  datosMedicos?: {
    hipertension_arterial?: boolean; 
    tiempo_diagnostico?: string;     
    tratamiento_hipertension?: string;
    tipo_dialisis?: string;
    turno?: string;
    diabetes?:string;
    vih?: boolean;
    vdrl?: boolean;
    hbsag?: boolean;
    anticore?: boolean;
    hc?: boolean;
    covid19?: boolean;
  };

  ultimoTratamiento?: {
    tratamiento?: string;
  }

  // Acceso vascular (estructura anidada)
  accesosVasculares?: {
    map(arg0: (acceso: any) => any): unknown;
    length: number;
    tipo?: "fistula" | "cateter-per" | "cateter-tem"; // Cambiado de tipoAcceso
    fecha_realizada?: string;         // Cambiado de fechaRealizada
    ubicacion?: string;
  };

  // Laboratorio (estructura anidada)
  ultimoLaboratorio?: {
    fecha?: string;
    hb?: number;
    hto?: number;
    plt?: number;
    gb?: number;
    neut?: number;
    linf?: number;
    glicemia?: number;
    urea?: number;
    creatinina?: number;
    proteinas_t?: number;            // Cambiado de proteinasT
    albumina?: number;
    globulinas?: number;
    na?: number;
    k?: number;
    cl?: number;
    ca?: number;
    p?: number;
  };
}