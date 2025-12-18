// hooks/usePatientSearch.ts
import { useState, useMemo } from "react";

interface Paciente {
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
    tipo_dialisis?: string;
    estado_paciente?: string;
    hipertension?: boolean;
    acceso_vascular?: string;
    vih?: boolean;
    vdrl?: boolean;
    hbsag?: boolean;
    covid19?: boolean;
}

type SortOption = 'nombre' | 'cedula' | 'estado' | 'fecha-ingreso';
type SortDirection = 'asc' | 'desc';

interface SearchFilters {
    dialisis: string;
    estado: string;
    hipertension: string;
    accesoVascular: string;
    vih: string;
    vdrl: string;
    hbsag: string;
    covid19: string;
}

interface UsePatientSearchReturn {
    filteredAndSorted: Paciente[];
    visiblePacientes: Paciente[];
    totalPages: number;
    activeFilterCount: number;
}

export const usePatientSearch = (
    pacientes: Paciente[],
    searchTerm: string,
    filters: SearchFilters,
    sortField: SortOption,
    sortDirection: SortDirection,
    page: number,
    itemsPerPage: number = 8
): UsePatientSearchReturn => {
    
    // 🔍 Filtrado y orden
    const filteredAndSorted = useMemo(() => {
        let data = [...pacientes];

        // 🔹 Búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(p =>
                p.nombre.toLowerCase().includes(term) ||
                p.apellido.toLowerCase().includes(term) ||
                p.cedula.includes(term) ||
                (p.enfermedad && p.enfermedad.toLowerCase().includes(term)) ||
                p.estado.toLowerCase().includes(term)
            );
        }

        // 🔹 Filtros avanzados
        data = data.filter(p => {
            if (filters.dialisis && p.tipo_dialisis !== filters.dialisis) return false;
            if (filters.estado && p.estado_paciente !== filters.estado) return false;
            if (filters.hipertension) {
                const isHipertension = filters.hipertension === "true";
                if (p.hipertension !== isHipertension) return false;
            }
            if (filters.accesoVascular && p.acceso_vascular !== filters.accesoVascular) return false;
            if (filters.vih) {
                const isVihPositive = filters.vih === "true";
                if (p.vih !== isVihPositive) return false;
            }
            if (filters.vdrl) {
                const isVdrlPositive = filters.vdrl === "true";
                if (p.vdrl !== isVdrlPositive) return false;
            }
            if (filters.hbsag) {
                const isHbsagPositive = filters.hbsag === "true";
                if (p.hbsag !== isHbsagPositive) return false;
            }
            if (filters.covid19) {
                const isCovidPositive = filters.covid19 === "true";
                if (p.covid19 !== isCovidPositive) return false;
            }
            return true;
        });

        // 🔽 Ordenamiento
        data.sort((a, b) => {
            let aValue: string | number = "";
            let bValue: string | number = "";

            switch (sortField) {
                case "nombre":
                    aValue = `${a.nombre} ${a.apellido}`.toLowerCase();
                    bValue = `${b.nombre} ${b.apellido}`.toLowerCase();
                    break;
                case "cedula":
                    aValue = a.cedula;
                    bValue = b.cedula;
                    break;
                case "estado":
                    aValue = a.estado.toLowerCase();
                    bValue = b.estado.toLowerCase();
                    break;
                case "fecha-ingreso":
                    aValue = new Date(a.ultimaVisita).getTime();
                    bValue = new Date(b.ultimaVisita).getTime();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return data;
    }, [pacientes, searchTerm, filters, sortField, sortDirection]);

    // 🔹 Paginación
    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const visiblePacientes = useMemo(() => {
        return filteredAndSorted.slice(
            (page - 1) * itemsPerPage,
            page * itemsPerPage
        );
    }, [filteredAndSorted, page, itemsPerPage]);

    // 🔹 Contador de filtros activos
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(filter => filter !== "").length;
    }, [filters]);

    return {
        filteredAndSorted,
        visiblePacientes,
        totalPages,
        activeFilterCount
    };
};