import { useState, useEffect } from 'react';
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
import { api } from "@/services/paciente.api";

/* -------------------------------------------------------------------------- */
/* Tipos                                   */
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

export default function NephrologyCalendar() {
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [storedEvents, setStoredEvents] = useState<CalendarEvent[]>([]);

    // Estados de carga y error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Cargar Eventos (GET)
    const fetchEvents = async () => {
        try {
            console.log('📅 Fetching calendar events...');
            const response = await api.get('/calendar/events');

            if (response.data.success) {
                setStoredEvents(response.data.events);
            } else {
                setError("No se pudieron cargar los eventos");
            }
        } catch (err) {
            console.error('❌ Error fetching events:', err);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

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

    // 2. Guardar Evento (POST / PUT)
    const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
        try {
            if (selectedEvent) {
                // --- ACTUALIZAR (PUT) ---
                console.log('🔄 Updating event:', selectedEvent.id);
                const response = await api.put(`/calendar/events/${selectedEvent.id}`, eventData);

                if (response.data.success) {
                    setStoredEvents((prev) =>
                        prev.map((event) =>
                            event.id === selectedEvent.id ? response.data.event : event
                        )
                    );
                }
            } else {
                // --- CREAR (POST) ---
                console.log('✨ Creating new event');
                const response = await api.post('/calendar/events', eventData);

                if (response.data.success) {
                    setStoredEvents((prev) => [...prev, response.data.event]);
                }
            }

            // Cerrar modal solo si tuvo éxito
            setIsModalOpen(false);
            setSelectedEvent(null);
            setSelectedDate(undefined);

        } catch (err) {
            console.error('❌ Error saving event:', err);
            alert("Hubo un error al guardar el evento. Intenta nuevamente.");
        }
    };

    // 3. Eliminar Evento (DELETE)
    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;

        try {
            console.log('🗑️ Deleting event:', selectedEvent.id);
            const response = await api.delete(`/calendar/events/${selectedEvent.id}`);

            if (response.data.success) {
                setStoredEvents((prev) =>
                    prev.filter((event) => event.id !== selectedEvent!.id)
                );
                setIsDeleteModalOpen(false);
                setSelectedEvent(null);
            }
        } catch (err) {
            console.error('❌ Error deleting event:', err);
            alert("Hubo un error al eliminar el evento.");
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
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const label = () => {
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
                                    : 'bg-[#162447] hover:bg-[#1f345c]'}`}
                            >
                                Mes
                            </button>
                            <button
                                onClick={() => handleViewChange('week')}
                                className={`px-4 py-2 rounded transition-colors ${view === 'week'
                                    ? 'bg-[#D4AF37] text-[#0A1733] font-bold'
                                    : 'bg-[#162447] hover:bg-[#1f345c]'}`}
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
        <div className="min-h-screen bg-white-100 flex flex-col">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 h-full">
                        <div className={`bg-white rounded-lg shadow-lg overflow-hidden h-full ${view === 'week' ? '' : 'mb-6'}`}>
                            {loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                                </div>
                            ) : (
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    popup
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{
                                        height: '100%',
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
                            )}
                        </div>

                        {view === 'month' && !loading && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-[#0A1733] mb-4">Categorías de Eventos</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <LegendItem color="#0A1733" border="#D4AF37" label="Hemodiálisis" />
                                    <LegendItem color="#FFF7DF" border="#D4AF37" label="Diálisis Peritoneal" />
                                    <LegendItem color="#EFE6C9" border="#D4AF37" label="Controles" />
                                    <LegendItem color="#FEE2E2" border="#DC2626" label="Emergencias" />
                                    <LegendItem color="#F3F4F6" border="#D4AF37" label="Otros" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                eventTitle={selectedEvent?.title || ''}
            />
        </div>
    );
}

function LegendItem({ color, border, label }: { color: string; border: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: color, border: `2px solid ${border}` }}></div>
            <span className="text-sm">{label}</span>
        </div>
    );
}