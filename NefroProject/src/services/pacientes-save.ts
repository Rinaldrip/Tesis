import { api } from "./paciente.api";
import type { PatientData } from "../types/patientInterface";

export const createPaciente = async (data: PatientData) => {
    try {
        const response = await api.post("paciente/add", data);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};
