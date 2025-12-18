// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';

interface DashboardData {
    stats: {
        pacientesActivos: number;
        proximosEventos: number;
        casosCriticos: number;
        pacientesHipertensos: number;
    };
    chart: Array<{
        month: string;
        Hemodialisis: number;
        Peritonial: number;
    }>;
    patients: Array<{
        id: number;
        cedula: string;
        nombre: string;
        apellido: string;
        fechaNacimiento: string;
        enfermedad: string;
        estado: string;
        ultimaVisita: string;
        creatina: string;
        proteinasT: string;
    }>;
}

// Datos mock para desarrollo (solo como respaldo)
const mockData: DashboardData = {
    stats: {
        pacientesActivos: 25,
        proximosEventos: 3,
        casosCriticos: 2,
        pacientesHipertensos: 15
    },
    chart: [
        { month: "Enero", Hemodialisis: 20, Peritonial: 15 },
        { month: "Febrero", Hemodialisis: 22, Peritonial: 13 },
        { month: "Marzo", Hemodialisis: 14, Peritonial: 25 },
        { month: "Abril", Hemodialisis: 21, Peritonial: 27 },
        { month: "Mayo", Hemodialisis: 20, Peritonial: 13 },
        { month: "Junio", Hemodialisis: 21, Peritonial: 22 },
    ],
    patients: [
        {
            id: 1,
            cedula: "12345678",
            nombre: "María",
            apellido: "González",
            fechaNacimiento: "1978-05-15",
            enfermedad: "Enfermedad renal crónica",
            estado: "Estable",
            ultimaVisita: "2024-01-15",
            creatina: "1.2 mg/dL",
            proteinasT: "6.5 g/dL"
        },
        {
            id: 2,
            cedula: "87654321",
            nombre: "Carlos",
            apellido: "Rodríguez",
            fechaNacimiento: "1961-08-22",
            enfermedad: "Hipertensión arterial",
            estado: "Mejorando",
            ultimaVisita: "2024-01-10",
            creatina: "2.8 mg/dL",
            proteinasT: "7.2 g/dL"
        }
    ]
};

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Intentando conectar al backend...');
            
            // URL del endpoint - ajusta según tu configuración
            const API_URL = 'http://localhost:4000/api/dashboard';
            
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            console.log('📡 Respuesta del servidor:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Datos recibidos del backend:', result);

            if (result.success && result.data) {
                setData(result.data);
            } else {
                throw new Error(result.error || 'Datos inválidos del servidor');
            }

        } catch (err) {
            console.error('❌ Error conectando al backend:', err);
            console.log('⚠️ Usando datos mock para desarrollo');
            
            // Usar datos mock temporalmente
            setData(mockData);
            setError(`No se pudo conectar al servidor: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return { data, loading, error, refetch: fetchDashboardData };
};