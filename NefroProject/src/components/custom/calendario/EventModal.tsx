import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CalendarEvent } from "./Calender";

interface EventFormValues {
    title: string;
    description: string;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    category: CalendarEvent["category"];
}

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, "id">) => void;
    onDelete?: () => void;
    event?: CalendarEvent | null;
    initialDate?: Date;
}

export default function EventModal({
    isOpen,
    onClose,
    onSave,
    onDelete,
    event,
    initialDate,
}: EventModalProps) {
    const form = useForm<EventFormValues>({
        defaultValues: {
            title: "",
            description: "",
            start_date: "",
            start_time: "",
            end_date: "",
            end_time: "",
            category: "other",
        },
    });

    // Cargar datos en modo edición o crear evento nuevo
    useEffect(() => {
        if (event) {
            const startDate = new Date(event.start_date);
            const endDate = new Date(event.end_date);

            form.reset({
                title: event.title,
                description: event.description,
                start_date: startDate.toISOString().split("T")[0],
                start_time: startDate.toTimeString().slice(0, 5),
                end_date: endDate.toISOString().split("T")[0],
                end_time: endDate.toTimeString().slice(0, 5),
                category: event.category,
            });
        } else if (initialDate) {
            const d = initialDate.toISOString().split("T")[0];

            form.reset({
                title: "",
                description: "",
                start_date: d,
                start_time: "08:00",
                end_date: d,
                end_time: "09:00",
                category: "other",
            });
        } else {
            form.reset();
        }
    }, [event, initialDate, isOpen]);

    const submitForm = (data: EventFormValues) => {
        const start = new Date(`${data.start_date}T${data.start_time}`);
        const end = new Date(`${data.end_date}T${data.end_time}`);

        onSave({
            title: data.title,
            description: data.description,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            category: data.category,
        });

        form.reset();
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-[#0A1733] text-xl">
                        {event ? "Editar Evento" : "Agregar Nuevo Evento"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submitForm)} className="space-y-6">
                        {/* Información general */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Información General del Evento
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    rules={{ required: "Title is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Título del Evento" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    rules={{ required: "Category required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoría *</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                >
                                                    <option value="hemodialysis">Hemodialisis</option>
                                                    <option value="peritoneal_dialysis">Dialisis Peritoneal</option>
                                                    <option value="controls">Control/Cita</option>
                                                    <option value="emergencies">Emergencias</option>
                                                    <option value="other">Otros Eventos</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Fechas y horas */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Agendar
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="start_date"
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Inicio</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="start_time"
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora de Inicio</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="end_date"
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Culminacion</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="end_time"
                                    rules={{ required: "Required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora de Culminación</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Descripción del Evento
                            </h3>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                rows={4}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                placeholder="Optional notes"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between pt-4 border-t">
                            {event && onDelete && (
                                <Button
                                    type="button"
                                    className="bg-red-600 text-white hover:bg-red-700"
                                    onClick={onDelete}
                                >
                                    Eliminar Evento
                                </Button>
                            )}

                            <div className="flex gap-3 ml-auto">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancelar
                                </Button>

                                <Button type="submit" className="bg-[#0A1733] text-white hover:bg-[#12204d]">
                                    {event ? "Actualizar Evento" : "Crear Evento"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
