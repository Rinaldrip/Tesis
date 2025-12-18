import { FileText } from "lucide-react";
import { PatientForm } from "../../components/custom/paciente/PattientForm";
import type { PatientData } from '../../types/patientInterface';
import { createPaciente } from "@/services/pacientes-save";
import { useNavigate } from "react-router";

function AddPatientPage() {
    const navigate = useNavigate();
    const handleCreate = async (data: PatientData) => {
        try {
            const result = await createPaciente(data);
            console.log("✅ Paciente creado:", result);
            navigate("/pacientes");
        } catch (error: any) {
            let errorMessage = "Error al crear el paciente";
            alert(`Error: ${errorMessage}`);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <FileText className="h-10 w-10 text-blue-600 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Formulario de Admisión de Pacientes
                        </h1>
                    </div>
                    <p className="text-gray-600">Sistema de Gestión Nefrológica</p>
                </div>
                {/* Formulario */}
                <PatientForm onSubmit={handleCreate} />
            </div>
        </div>
    );
}

export default AddPatientPage;