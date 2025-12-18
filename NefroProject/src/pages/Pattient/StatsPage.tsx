import { useParams } from "react-router-dom";
import { PatientDashboard } from "@/components/custom/stats/PatientDashboard";
import BackToPatientButton from "@/components/custom/BackToPatientButton";

export default function PatientPage() {
    const { cedula } = useParams<{ cedula: string }>();

    return (
        <div>
            <BackToPatientButton />
            <div className="p-6 bg-gray-50 min-h-screen">
                <PatientDashboard patientId={cedula || "0"} />
            </div>
        </div>
    );
}
