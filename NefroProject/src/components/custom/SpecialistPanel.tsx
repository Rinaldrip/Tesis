import React from 'react';
import { Phone, Mail, Clock, UserRoundX, CalendarX } from 'lucide-react';

// Interfaces basadas en tu respuesta del API
interface SpecialistData {
  full_name: string;
  specialty: string;
  phone: string;
  email: string;
  direction?: string;
}

interface EventData {
  id: string | number;
  nombre: string;
  descripcion: string;
  categoria: string;
  hora: string;
}

interface SpecialistPanelProps {
  specialist: SpecialistData | null;
  events: EventData[];
}

const SpecialistPanel: React.FC<SpecialistPanelProps> = ({ specialist, events }) => {
  // 1. SEGURIDAD: Aseguramos que events sea siempre un array, incluso si llega null
  const safeEvents = events || [];

  const getTypeColor = (type: string) => {
    const normalizedType = type?.toLowerCase() || 'otro';
    switch (normalizedType) {
      case 'critico':
        return 'text-red-700 bg-red-100 ring-1 ring-red-200';
      case 'nuevo':
        return 'text-blue-700 bg-blue-100 ring-1 ring-blue-200';
      case 'reunion':
        return 'text-purple-700 bg-purple-100 ring-1 ring-purple-200';
      case 'rutina':
        return 'text-green-700 bg-green-100 ring-1 ring-green-200';
      default:
        return 'text-amber-700 bg-amber-100 ring-1 ring-amber-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "Dr";
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!specialist) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserRoundX className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Sin médico en servicio</h3>
        <p className="text-gray-500 mt-2">No hay un especialista marcado como "Activo" en este momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Especialista en Guardia</h2>
        <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-green-500"></span>
      </div>

      {/* Specialist Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center shadow-md shrink-0">
            <span className="text-white font-bold text-xl tracking-wider">
              {getInitials(specialist.full_name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate text-lg">
              Dr. {specialist.full_name || 'Nombre no disponible'}
            </h3>
            <p className="text-blue-700 font-medium text-sm truncate">
              {specialist.specialty || 'Especialista'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Información de Contacto
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Phone className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium">{specialist.phone || 'Sin teléfono'}</span>
          </div>

          <div className="flex items-center space-x-3 text-sm group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Mail className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-gray-700 truncate" title={specialist.email}>
              {specialist.email || 'Sin correo'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-sm group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
              <Clock className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            </div>
            {/* AQUI ESTABA EL ERROR: Faltaba este texto */}
            <span className="text-gray-700">{specialist.direction || 'Sin dirección'}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule (Events) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Agenda del Día
          </h4>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {safeEvents.length} eventos
          </span>
        </div>

        <div className="space-y-1">
          {safeEvents.length > 0 ? (
            safeEvents.map((event, index) => (
              <div
                key={event.id || index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="text-xs font-bold text-gray-500 w-16 pt-1 whitespace-nowrap">
                  {event.hora}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {event.nombre}
                  </p>
                  {event.descripcion && (
                    <p className="text-xs text-gray-500 truncate">
                      {event.descripcion}
                    </p>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getTypeColor(event.categoria)}`}>
                  {event.categoria}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 flex flex-col items-center">
              <CalendarX className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">No hay eventos para hoy</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistPanel;