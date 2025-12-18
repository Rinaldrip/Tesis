// components/custom/HeaderTitle.tsx
import { useLocation } from 'react-router-dom';

interface RouteConfig {
    title: string;
    subtitle: string;
}

const routeConfigs: Record<string, RouteConfig> = {
    '/': {
        title: 'Inicio',
        subtitle: 'Bienvenido al sistema de gestión'
    },
    '/pacientes': {
        title: 'Pacientes',
        subtitle: 'Gestión de pacientes del sistema'
    },
    '/pacientes/add': {
        title: 'Agregar Paciente',
        subtitle: 'Agregar nuevo paciente al sistema'
    },
    '/pacientes/:cedula': {
        title: 'Información del Paciente',
        subtitle: 'Información detallada del paciente'
    },
    '/pacientes/:cedula/evo': {
        title: 'Evolución del Paciente',
        subtitle: 'Evolución de consultas y tratamientos'
    },
    '/estadisticas': {
        title: 'Estadísticas',
        subtitle: 'Estadísticas y métricas del sistema'
    },
    '/calendario': {
        title: 'Calendario',
        subtitle: 'Calendario de citas y eventos'
    },
    '/reportes': {
        title: 'Reportes',
        subtitle: 'Reportes y documentación'
    },
    '/personal': {
        title: 'Personal',
        subtitle: 'Gestión del personal médico'
    },
    '/configuracion': {
        title: 'Configuración',
        subtitle: 'Configuración del sistema'
    }
};

export const HeaderTitle = () => {
    const location = useLocation();

    const getRouteConfig = (): RouteConfig => {
        // Buscar coincidencia exacta
        if (routeConfigs[location.pathname]) {
            return routeConfigs[location.pathname];
        }

        // Si no encuentra coincidencia, generar título desde la URL
        const segments = location.pathname.split('/').filter(segment => segment);
        const defaultTitle = segments.length > 0
            ? segments[segments.length - 1].charAt(0).toUpperCase() +
            segments[segments.length - 1].slice(1).replace(/-/g, ' ')
            : 'Inicio';

        return {
            title: defaultTitle,
            subtitle: 'Sistema de gestión de pacientes renales'
        };
    };

    const { title, subtitle } = getRouteConfig();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
        </div>
    );
};