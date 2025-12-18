import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventModal from './EventModal';
import ConfirmDeleteModal from './DelateEvent';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                   Tipos                                    */
/* -------------------------------------------------------------------------- */

export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    category:
    | 'hemodialysis'
    | 'peritoneal_dialysis'
    | 'controls'
    | 'emergencies'
    | 'other';
}

// Configuración completa de localización en español
const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: es }),
    getDay,
    locales,
});

// Mensajes en español para el calendario
const messages = {
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    allDay: 'Todo el día',
    week: 'Semana',
    work_week: 'Semana laboral',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    today: 'Hoy',
    agenda: 'Agenda',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+ Ver más (${total})`
};

interface CalendarEventWithDates {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: CalendarEvent;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        title: 'Sesión de Hemodiálisis - Unidad A',
        description: 'Sesión matutina de hemodiálisis para la Unidad A',
        start_date: new Date(2025, 10, 24, 8, 0).toISOString(),
        end_date: new Date(2025, 10, 24, 12, 0).toISOString(),
        category: 'hemodialysis',
    },
    {
        id: '2',
        title: 'Capacitación en Diálisis Peritoneal',
        description:
            'Entrenamiento para pacientes y familiares de diálisis peritoneal',
        start_date: new Date(2025, 10, 24, 14, 0).toISOString(),
        end_date: new Date(2025, 10, 24, 16, 0).toISOString(),
        category: 'peritoneal_dialysis',
    },
    {
        id: '3',
        title: 'Consulta de Seguimiento Mensual',
        description:
            'Consultas de seguimiento para pacientes con enfermedad renal crónica',
        start_date: new Date(2025, 10, 25, 9, 0).toISOString(),
        end_date: new Date(2025, 10, 25, 13, 0).toISOString(),
        category: 'controls',
    },
    {
        id: '4',
        title: 'Hemodiálisis - Unidad B',
        description: 'Sesión vespertina de hemodiálisis en la Unidad B',
        start_date: new Date(2025, 10, 25, 13, 0).toISOString(),
        end_date: new Date(2025, 10, 25, 17, 0).toISOString(),
        category: 'hemodialysis',
    },
    {
        id: '5',  // Nuevo evento
        title: 'Revisión de Equipos de Hemodiálisis',
        description: 'Mantenimiento preventivo y calibración de equipos de hemodiálisis en todas las unidades',
        start_date: new Date(2025, 12, 5, 10, 0).toISOString(),
        end_date: new Date(2025, 8, 26, 15, 0).toISOString(),
        category: 'other',
    },
];

export default function NephrologyCalendar() {
    const [storedEvents, setStoredEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const events: CalendarEventWithDates[] = storedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        resource: event,
    }));

    const handleSelectSlot = ({ start }: { start: Date }) => {
        setSelectedEvent(null);
        setSelectedDate(start);
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event: CalendarEventWithDates) => {
        setSelectedEvent(event.resource);
        setSelectedDate(undefined);
        setIsModalOpen(true);
    };

    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        if (selectedEvent) {
            setStoredEvents(
                storedEvents.map((event) =>
                    event.id === selectedEvent.id
                        ? { ...eventData, id: event.id }
                        : event,
                ),
            );
        } else {
            const newEvent: CalendarEvent = {
                ...eventData,
                id: Date.now().toString(),
            };
            setStoredEvents([...storedEvents, newEvent]);
        }

        setIsModalOpen(false);
        setSelectedEvent(null);
        setSelectedDate(undefined);
    };

    const handleConfirmDelete = () => {
        if (selectedEvent) {
            setStoredEvents(
                storedEvents.filter((event) => event.id !== selectedEvent.id),
            );
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
        }
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const eventStyleGetter = (event: CalendarEventWithDates) => {
        const category = event.resource.category;

        let style: React.CSSProperties = {
            borderRadius: '6px',
            border: '1px solid',
            fontSize: '0.85rem',
            padding: '4px 8px',
            fontWeight: 600,
        };

        /* Paleta azul marino + dorado */
        switch (category) {
            case 'hemodialysis':
                style.backgroundColor = '#0A1733';
                style.color = '#D4AF37';
                style.borderColor = '#D4AF37';
                break;
            case 'peritoneal_dialysis':
                style.backgroundColor = '#FFF7DF';
                style.color = '#0A1733';
                style.borderColor = '#D4AF37';
                break;
            case 'controls':
                style.backgroundColor = '#EFE6C9';
                style.color = '#0A1733';
                style.borderColor = '#D4AF37';
                break;
            case 'emergencies':
                style.backgroundColor = '#FEE2E2';
                style.color = '#7F1D1D';
                style.borderColor = '#DC2626';
                break;
            case 'other':
                style.backgroundColor = '#F3F4F6';
                style.color = '#374151';
                style.borderColor = '#D4AF37';
                break;
        }

        return { style };
    };

    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };

        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };

        const label = () => {
            // Formatear el mes y año en español con capitalización
            const monthYear = format(toolbar.date, "MMMM yyyy", { locale: es });
            return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        };

        return (
            <div className="bg-blue-950 text-white px-6 py-5 rounded-t-lg shadow-inner">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="text-[#D4AF37]" size={30} />
                        <div>
                            <h1 className="text-xl font-bold tracking-wide">Calendario del Servicio de Nefrología</h1>
                            <p className="text-sm text-gray-300">Hospital Universitario Manuel Núñez Tovar</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={goToBack} className="p-2 hover:bg-[#162447] rounded transition-colors">
                            <ChevronLeft size={20} />
                        </button>

                        <span className="text-lg font-semibold min-w-[140px] text-center">{label()}</span>

                        <button onClick={goToNext} className="p-2 hover:bg-[#162447] rounded transition-colors">
                            <ChevronRight size={20} />
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewChange('month')}
                                className={`px-4 py-2 rounded transition-colors ${view === 'month'
                                    ? 'bg-[#D4AF37] text-[#0A1733] font-bold'
                                    : 'bg-[#162447] hover:bg-[#1f345c]'
                                    }`}
                            >
                                Mes
                            </button>

                            <button
                                onClick={() => handleViewChange('week')}
                                className={`px-4 py-2 rounded transition-colors ${view === 'week'
                                    ? 'bg-[#D4AF37] text-[#0A1733] font-bold'
                                    : 'bg-[#162447] hover:bg-[#1f345c]'
                                    }`}
                            >
                                Semana
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className={`flex-1 ${view === 'week' ? 'flex flex-col' : ''}`}>
                <div className={`${view === 'week' ? 'flex-1' : ''}`}>
                    <div className="max-w-7xl mx-auto p-4 md:p-6 h-full">
                        {/* Calendario principal - Ocupa toda la altura en vista semanal */}
                        <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${view === 'week' ? 'h-full' : 'mb-6'}`}>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                popup
                                startAccessor="start"
                                endAccessor="end"
                                style={{
                                    height: view === 'week' ? '100%' : 'calc(100vh - 200px)',
                                    minHeight: view === 'week' ? 'auto' : '620px'
                                }}
                                view={view}
                                onView={handleViewChange}
                                date={date}
                                onNavigate={(d) => setDate(d)}
                                selectable
                                onSelectSlot={handleSelectSlot}
                                onSelectEvent={handleSelectEvent}
                                eventPropGetter={eventStyleGetter}
                                components={{ toolbar: CustomToolbar }}
                                messages={messages}
                                culture="es"
                            />
                        </div>

                        {/* Leyenda - Solo se muestra en vista mensual */}
                        {view === 'month' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-[#0A1733] mb-4">
                                    Categorías de Eventos
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <LegendItem color="#0A1733" border="#D4AF37" label="Hemodiálisis" />
                                    <LegendItem
                                        color="#FFF7DF"
                                        border="#D4AF37"
                                        label="Diálisis Peritoneal"
                                    />
                                    <LegendItem color="#EFE6C9" border="#D4AF37" label="Controles" />
                                    <LegendItem color="#FEE2E2" border="#DC2626" label="Emergencias" />
                                    <LegendItem color="#F3F4F6" border="#D4AF37" label="Otros" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Crear/Editar */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEvent(null);
                    setSelectedDate(undefined);
                }}
                onSave={handleSaveEvent}
                onDelete={selectedEvent ? () => setIsDeleteModalOpen(true) : undefined}
                event={selectedEvent}
                initialDate={selectedDate}
            />

            {/* Modal Eliminar */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                eventTitle={selectedEvent?.title || ''}
            />
        </div>
    );
}

function LegendItem({
    color,
    border,
    label,
}: {
    color: string;
    border: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color, border: `2px solid ${border}` }}
            ></div>
            <span className="text-sm">{label}</span>
        </div>
    );
}