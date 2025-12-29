import { useEffect } from 'react';
import { User, Home, Stethoscope, Heart, BrainCog, TestTube, Activity, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { PatientData } from '../../../types/patientInterface';

interface PatientEditFormProps {
    initialData?: PatientData;
    onSubmit: (data: PatientData) => Promise<void>;
    onCancel?: () => void;
}

export const PatientEditForm = ({ initialData, onSubmit, onCancel }: PatientEditFormProps) => {
    const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<PatientData>({
        defaultValues: initialData
    });

    useEffect(() => {
        if (initialData) {
            try {
                // Extraer el primer contacto de emergencia (si existe)
                const contactoEmergencia = initialData.contactosEmergencia &&
                    typeof initialData.contactosEmergencia === 'object' &&
                    !Array.isArray(initialData.contactosEmergencia)
                    ? initialData.contactosEmergencia
                    : { nombre: '', telefono: '', parentesco: '' };

                // Extraer el primer acceso vascular (si existe)
                const accesoVascular = initialData.accesosVasculares &&
                    Array.isArray(initialData.accesosVasculares) &&
                    initialData.accesosVasculares.length > 0
                    ? initialData.accesosVasculares[0]
                    : { tipo: '', fecha_realizada: '', ubicacion: '' };

                // Formatear fechas YYYY-MM-DD
                const formattedData: any = {
                    paciente: {
                        ...initialData.paciente,
                        fecha_nacimiento: initialData.paciente.fecha_nacimiento
                            ? String(initialData.paciente.fecha_nacimiento).split('T')[0]
                            : ''
                    },
                    datosIngreso: {
                        ...initialData.datosIngreso,
                        fecha_ingreso: initialData.datosIngreso?.fecha_ingreso
                            ? String(initialData.datosIngreso.fecha_ingreso).split('T')[0]
                            : '',
                        fecha_egreso: initialData.datosIngreso?.fecha_egreso
                            ? String(initialData.datosIngreso.fecha_egreso).split('T')[0]
                            : '',
                    },
                    datosMedicos: initialData.datosMedicos || {},
                    ultimoTratamiento: initialData.ultimoTratamiento || { tratamiento: '' },
                    // Campos aplanados para el formulario
                    contactosEmergencia: contactoEmergencia,
                    accesosVasculares: [accesoVascular] // Mantener como array con un elemento
                };

                // Formatear fecha en acceso vascular si existe
                if (formattedData.accesosVasculares[0].fecha_realizada) {
                    formattedData.accesosVasculares[0].fecha_realizada =
                        String(formattedData.accesosVasculares[0].fecha_realizada).split('T')[0];
                }

                console.log("Formatted data for form reset:", {
                    paciente: formattedData.paciente,
                    contactosEmergencia: formattedData.contactosEmergencia,
                    accesosVasculares: formattedData.accesosVasculares
                });

                reset(formattedData);
            } catch (error) {
                console.error("Error resetting form:", error);
            }
        }
    }, [initialData, reset]);

    // Función para convertir string a boolean
    const convertStringToBoolean = (value: any): boolean => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (typeof value === 'boolean') return value;
        return false;
    };

    const submitHandler = async (data: PatientData) => {
        // Convertir strings a booleanos
        const processedData = {
            ...data,
            paciente: {
                ...data.paciente,
                sexo: convertStringToBoolean(data.paciente.sexo)
            },
            datosMedicos: {
                ...data.datosMedicos,
                hipertension_arterial: convertStringToBoolean(data.datosMedicos?.hipertension_arterial),
                vih: convertStringToBoolean(data.datosMedicos?.vih),
                vdrl: convertStringToBoolean(data.datosMedicos?.vdrl),
                hbsag: convertStringToBoolean(data.datosMedicos?.hbsag),
                anticore: convertStringToBoolean(data.datosMedicos?.anticore),
                hc: convertStringToBoolean(data.datosMedicos?.hc),
                covid19: convertStringToBoolean(data.datosMedicos?.covid19),
            }
        };

        await onSubmit(processedData);
        reset(processedData);
    };

    // --- Componentes Reutilizables (igual que antes) ---
    const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-4">
                <div className="mr-3 text-blue-600">{icon}</div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            {children}
        </div>
    );

    const InputField = ({ label, name, type = "text", placeholder = "", required = false, className = "", disabled = false }: any) => (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...register(name, { required })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors 
                    ${disabled ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' : 'border-gray-300 focus:border-blue-500'}`}
            />
        </div>
    );

    const TextareaField = ({ label, name, rows = 3, required = false, className = "" }: any) => (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                rows={rows}
                {...register(name, { required })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            />
        </div>
    );

    const RadioField = ({ label, name, options, required = false, className = "" }: any) => (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex gap-4">
                {options.map((option: any) => (
                    <label key={option.value} className="flex items-center">
                        <input
                            type="radio"
                            value={option.value}
                            {...register(name, { required })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const SelectField = ({ label, name, options, required = false, className = "" }: any) => (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                {...register(name, { required })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
                <option value="">Seleccionar...</option>
                {options.map((option: any) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-6 pb-20">
            {/* Header de Edición */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Editando paciente: <span className="font-bold">{initialData?.paciente.nombre} {initialData?.paciente.apellido}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <SectionCard title="Información Personal" icon={<User />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Nombre" name="paciente.nombre" required />
                    <InputField label="Apellido" name="paciente.apellido" required />
                    <InputField label="Cédula" name="paciente.cedula" type="number" required disabled={true} />
                    <InputField label="Teléfono" name="paciente.telefono" type="tel" />
                    <InputField label="Fecha de nacimiento" name="paciente.fecha_nacimiento" type="date" />
                    <InputField label="Lugar de nacimiento" name="paciente.lugar_nacimiento" />
                    <SelectField
                        label="Etnia"
                        name="paciente.etnia"
                        options={[
                            { value: "Afro", label: "Afrodescendiente" },
                            { value: "Caucasico", label: "Caucásico" },
                            { value: "Asiatico", label: "Asiático" },
                        ]}
                    />
                    <RadioField
                        label="Sexo"
                        name="paciente.sexo"
                        options={[
                            { value: "true", label: "Masculino" },
                            { value: "false", label: "Femenino" },
                        ]}
                    />
                    <InputField label="Dirección" name="paciente.direccion" className="col-span-3" />
                </div>
            </SectionCard>

            {/* Contacto Emergencia */}
            <SectionCard title="Contacto de Emergencia" icon={<Home className="text-red-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Nombre" name="contactosEmergencia.nombre" required />
                    <InputField label="Teléfono" name="contactosEmergencia.telefono" type="tel" required />
                    <InputField label="Parentesco" name="contactosEmergencia.parentesco" required />
                </div>
            </SectionCard>

            {/* Datos clínicos */}
            <SectionCard title="Datos Clínicos" icon={<Stethoscope className="text-teal-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Fecha ingreso" name="datosIngreso.fecha_ingreso" type="date" />
                    <InputField label="Fecha egreso" name="datosIngreso.fecha_egreso" type="date" />
                    <SelectField
                        label="Estado"
                        name="paciente.estado"
                        options={[
                            { value: "Estable", label: "Estable" },
                            { value: "Mejorando", label: "Mejorando" },
                            { value: "Critico", label: "Critico" },
                            { value: "Inactivo", label: "Inactivo" },
                            { value: "Activo", label: "Activo" },
                        ]}
                        required
                    />
                    <InputField label="Etiología enfermedad renal" name="datosIngreso.etiologia_enfermedad_renal" className="col-span-3" />
                    <InputField label="Causa egreso" name="datosIngreso.causa_egreso" className="col-span-3" />
                    <InputField label="Peso ingreso (kg)" name="datosIngreso.peso_ingreso_kg" type="number" />
                    <InputField label="Talla (cm)" name="datosIngreso.talla_cm" type="number" />
                    <InputField label="Volumen residual (cc)" name="datosIngreso.volumen_residual_cc" type="number" />
                </div>
            </SectionCard>

            {/* Presión Arterial */}
            <SectionCard title="Presión Arterial y Diabetes" icon={<Heart className="text-red-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <RadioField
                        label="Hipertensión arterial"
                        name="datosMedicos.hipertension_arterial"
                        options={[
                            { value: "true", label: "Sí" },
                            { value: "false", label: "No" },
                        ]}
                    />
                    <InputField label="Tiempo diagnóstico" name="datosMedicos.tiempo_diagnostico" placeholder="Ej: 5 años" />
                    <SelectField
                        label="Diabetes"
                        name="datosMedicos.diabetes"
                        options={[
                            { value: "NA", label: "No padece de Diabetes" },
                            { value: "diabetes1", label: "Diabetes mellitus tipo 1" },
                            { value: "diabetes2", label: "Diabetes mellitus tipo 2" },
                        ]}
                    />
                    <TextareaField label="Tratamiento hipertensión" name="datosMedicos.tratamiento_hipertension" className="col-span-3" />
                </div>
            </SectionCard>

            {/* Diálisis */}
            <SectionCard title="Diálisis" icon={<BrainCog className="text-blue-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField
                        label="Tipo de diálisis"
                        name="datosMedicos.tipo_dialisis"
                        options={[
                            { value: "Hemodialisis", label: "Hemodiálisis" },
                            { value: "Peritoneal", label: "Diálisis Peritoneal" },
                        ]}
                    />
                    <SelectField
                        label="Turno de diálisis"
                        name="datosMedicos.turno"
                        options={[
                            { value: "Mañana", label: "Mañana" },
                            { value: "Tarde", label: "Tarde" },
                        ]}
                    />
                    <TextareaField label="Tratamiento de enfermedad renal" name="ultimoTratamiento.tratamiento" className="col-span-3" />
                </div>
            </SectionCard>

            {/* Serología */}
            <SectionCard title="Serología" icon={<TestTube className="text-purple-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["vih", "vdrl", "hbsag", "anticore", "hc", "covid19"].map((test) => (
                        <RadioField
                            key={test}
                            label={test.toUpperCase()}
                            name={`datosMedicos.${test}`}
                            options={[
                                { value: "true", label: "Positivo" },
                                { value: "false", label: "Negativo" },
                            ]}
                        />
                    ))}
                </div>
            </SectionCard>

            {/* Acceso vascular - CORREGIDO */}
            <SectionCard title="Acceso Vascular" icon={<Activity className="text-orange-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField
                        label="Tipo acceso"
                        name="accesosVasculares.0.tipo"
                        options={[
                            { value: "fistula", label: "Fístula VA" },
                            { value: "cateter-per", label: "Catéter Permacath" },
                            { value: "cateter-tem", label: "Catéter Temporal" },
                        ]}
                    />
                    <InputField
                        label="Fecha realizada"
                        name="accesosVasculares.0.fecha_realizada"
                        type="date"
                    />
                    <InputField
                        label="Ubicación"
                        name="accesosVasculares.0.ubicacion"
                        required
                    />
                </div>
            </SectionCard>

            {/* Botones Flotantes */}
            <div className="fixed bottom-4 right-4 sm:right-8 left-4 sm:left-auto z-50">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 flex gap-3">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            <X size={18} />
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting || !isDirty}
                        className={`flex items-center justify-center gap-2 px-6 py-2 rounded-md text-white transition-colors font-medium shadow-sm
                            ${isSubmitting || !isDirty
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'}`}
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Guardando...' : 'Actualizar'}
                    </button>
                </div>
            </div>
        </form>
    );
};