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
import { useEffect } from "react";

interface EspecialistaFormValues {
    fullName: string;
    dateOfBirth: string;
    specialty: string;
    graduationYear: string;
    university: string;
    email: string;
    phone: string;
    NumColegio: string;
    NumMpps: string;
    direction: string;
    cedula: string;
}

interface ModalEspecialistaProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: EspecialistaFormValues) => void;
    initialData?: EspecialistaFormValues;
}

export default function ModalEspecialista({
    open,
    onClose,
    onSubmit,
    initialData,
}: ModalEspecialistaProps) {

    const form = useForm<EspecialistaFormValues>({
        defaultValues: {
            fullName: "",
            dateOfBirth: "",
            specialty: "",
            graduationYear: "",
            university: "",
            email: "",
            phone: "",
            NumColegio: "",
            NumMpps: "",
            direction: "",
            cedula: "",
        },
    });

    // 🔥 IMPORTANTE: mover este useEffect arriba del return
    useEffect(() => {
        if (initialData) {
            // Carga datos al editar
            form.reset(initialData);
        } else {
            // Limpia al crear uno nuevo
            form.reset();
        }
    }, [initialData, open]);

    const submitForm = (data: EspecialistaFormValues) => {
        onSubmit(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-blue-900 text-xl">
                        {initialData ? "Editar Especialista" : "Añadir Especialista"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(submitForm)} className="space-y-6">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Información Personal
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    rules={{ required: "Este campo es obligatorio" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre completo *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Juan Pérez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    rules={{ required: "Este campo es obligatorio" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de nacimiento *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="cedula"
                                    rules={{ required: "Cédula requerida" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cédula *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="12345678"
                                                    {...field}
                                                    disabled={!!initialData}   // ← 🔥 bloquea en modo edición
                                                    className={initialData ? "bg-gray-100 cursor-not-allowed" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                                <FormField
                                    control={form.control}
                                    name="phone"
                                    rules={{ required: "Número obligatorio" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+58 412-1234567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{
                                        required: "Correo obligatorio",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Correo inválido",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Correo electrónico *</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="direction"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Centro Médico..." {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Formación Profesional */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Formación Profesional
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="specialty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Especialidad</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nefrología" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="university"
                                    rules={{ required: "Este campo es obligatorio" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Universidad *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="UCV" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="graduationYear"
                                    rules={{
                                        required: "Obligatorio",
                                        pattern: {
                                            value: /^(19|20)\d{2}$/,
                                            message: "Año inválido",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Año de egreso *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="2010" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Registros Profesionales */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                                Registros Profesionales
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="NumColegio"
                                    rules={{ required: "Número requerido" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Colegio *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="NumMpps"
                                    rules={{ required: "Número requerido" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de MPPS *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="87654321" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* footer */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>

                            <Button type="submit" className="bg-blue-900 text-white">
                                {initialData ? "Actualizar" : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
