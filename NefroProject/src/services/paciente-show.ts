import { api } from "./paciente.api";
import type { PatientData } from "../types/patientInterface";

export const pacienteByID= async (cedula: string): Promise<PatientData> => {
    try {
        const response = await api.get(`/pacientes/${cedula}`);
        return response.data;
    } catch (error: any) {
        console.error(`Error getting paciente ${cedula}:`, error);
        throw error;
    }
};

