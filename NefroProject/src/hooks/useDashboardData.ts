// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';

// Definimos la interfaz del Especialista
interface Specialist {
    full_name: string;
    specialty: string;
    phone: string;
    email: string;
    direction?: string;
}

// Definimos la interfaz del Evento
interface EventData {
    id: string;
    nombre: string;
    descripcion: string;
    categoria: string;
    hora: string;
}

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
    // --- CORRECCIÓN AQUÍ ---
    // Antes: Array<{...}> 
    // Ahora: Specialist | null (Objeto único)
    specialist: Specialist | null; 
    
    events: EventData[];
}

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Intentando conectar al backend...');
            const API_URL = 'http://localhost:4000/api/dashboard';
            
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
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
            // Si quieres datos falsos de prueba cuando falla, descomenta esto,
            // pero para producción es mejor mostrar el error.
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