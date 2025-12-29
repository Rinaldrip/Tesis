// hooks/usePatients.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/paciente.api';

interface Patient {
    cedula: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    enfermedad: string;
    tipo_dialisis: string;
    acceso_vascular: string;
    hipertension_arterial: boolean;
    estado: string;
    ultimaVisita: string;
    creatinina: number;
    proteinasT: number;
    edad: number;
}

interface UsePatientsReturn {
    patients: Patient[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: {
        search: string;
        estado: string;
        dialisis: string;
        hipertension: string;
        acceso_vascular: string;
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    setFilters: (filters: Partial<UsePatientsReturn['filters']>) => void;
    refetch: () => Promise<void>;
}

export const usePatients = (initialPage = 1, initialLimit = 20): UsePatientsReturn => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: initialPage,
        limit: initialLimit,
        totalPages: 0
    });
    
    const [filters, setFiltersState] = useState({
        search: '',
        estado: '',
        dialisis: '',
        hipertension: '',
        acceso_vascular: '',
        sortBy: 'fecha-ingreso',
        sortOrder: 'desc' as 'asc' | 'desc'
    });

    const setFilters = useCallback((newFilters: Partial<typeof filters>) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
        // Resetear a página 1 cuando cambian los filtros
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                ...(filters.search && { search: filters.search }),
                ...(filters.estado && { estado: filters.estado }),
                ...(filters.dialisis && { dialisis: filters.dialisis }),
                ...(filters.hipertension && { hipertension: filters.hipertension }),
                ...(filters.acceso_vascular && { acceso_vascular: filters.acceso_vascular })
            });

            const response = await api.get(`/pacientes?${params.toString()}`);
            
            if (response.data.success) {
                setPatients(response.data.data);
                setPagination(response.data.pagination);
            } else {
                throw new Error(response.data.error || 'Error al cargar pacientes');
            }
        } catch (err: any) {
            console.error('Error fetching patients:', err);
            setError(err.response?.data?.error || err.message || 'Error al cargar pacientes');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return {
        patients,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        refetch: fetchPatients
    };
};