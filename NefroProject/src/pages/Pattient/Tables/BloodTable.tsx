import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Save, Trash2, Filter, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TableFooter } from "@/components/custom/TableFooter";
import { formatDate } from "@/helpers/formatDate";

/* ------------------ BloodTestsTable ------------------ */
export interface BloodTest {
    id: string;
    fecha: string;
    hb: string;
    hto: string;
    gb: string;
    neut: string;
    linf: string;
    eos: string;
    plt: string;
    glicemia: string;
    urea: string;
    creatinina: string;
    proteinas_t: string;
    albumina: string;
    globulinas: string;
    colesterol: string;
    trigliceridos: string;
    ac_urico: string;
    tgo: string;
    tgp: string;
    bt: string;
    bd: string;
    bi: string;
    na: string;
    k: string;
    cl: string;
    ca: string;
    p: string;
    mg: string;
    pt: string;
    ptt: string;
}

interface BloodTestForm {
    fecha: string;
    hb: string;
    hto: string;
    gb: string;
    neut: string;
    linf: string;
    eos: string;
    plt: string;
    glicemia: string;
    urea: string;
    creatinina: string;
    proteinas_t: string;
    albumina: string;
    globulinas: string;
    colesterol: string;
    trigliceridos: string;
    ac_urico: string;
    tgo: string;
    tgp: string;
    bt: string;
    bd: string;
    bi: string;
    na: string;
    k: string;
    cl: string;
    ca: string;
    p: string;
    mg: string;
    pt: string;
    ptt: string;
}

interface BloodTestsTableProps {
    data?: BloodTest[];
    loading?: boolean;
    error?: string;
    onAddItem?: (item: Omit<BloodTest, 'id'>) => Promise<void>;
    onDeleteItem?: (id: string) => Promise<void>;
    refetch?: () => Promise<void>;
}

const ITEMS_PER_PAGE = 1;

// Función para formatear valores vacíos
const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
        return 'N/A';
    }
    return String(value);
};

// Función para agrupar campos por categorías
const getFieldGroups = () => [
    {
        title: "Hemograma",
        fields: [
            { key: 'hb', label: 'Hemoglobina (HB)', unit: 'g/dL' },
            { key: 'hto', label: 'Hematocrito (HTO)', unit: '%' },
            { key: 'gb', label: 'Glóbulos Blancos (GB)', unit: '/mm³' },
            { key: 'neut', label: 'Neutrófilos', unit: '%' },
            { key: 'linf', label: 'Linfocitos', unit: '%' },
            { key: 'eos', label: 'Eosinófilos', unit: '%' },
            { key: 'plt', label: 'Plaquetas (PLT)', unit: '/mm³' }
        ]
    },
    {
        title: "Bioquímica",
        fields: [
            { key: 'glicemia', label: 'Glicemia', unit: 'mg/dL' },
            { key: 'urea', label: 'Urea', unit: 'mg/dL' },
            { key: 'creatinina', label: 'Creatinina', unit: 'mg/dL' },
            { key: 'proteinas_t', label: 'Proteínas Totales', unit: 'g/dL' },
            { key: 'albumina', label: 'Albúmina', unit: 'g/dL' },
            { key: 'globulinas', label: 'Globulinas', unit: 'g/dL' }
        ]
    },
    {
        title: "Lípidos",
        fields: [
            { key: 'colesterol', label: 'Colesterol Total', unit: 'mg/dL' },
            { key: 'trigliceridos', label: 'Triglicéridos', unit: 'mg/dL' },
            { key: 'ac_urico', label: 'Ácido Úrico', unit: 'mg/dL' }
        ]
    },
    {
        title: "Pruebas Hepáticas",
        fields: [
            { key: 'tgo', label: 'TGO (AST)', unit: 'U/L' },
            { key: 'tgp', label: 'TGP (ALT)', unit: 'U/L' },
            { key: 'bt', label: 'Bilirrubina Total', unit: 'mg/dL' },
            { key: 'bd', label: 'Bilirrubina Directa', unit: 'mg/dL' },
            { key: 'bi', label: 'Bilirrubina Indirecta', unit: 'mg/dL' }
        ]
    },
    {
        title: "Electrolitos",
        fields: [
            { key: 'na', label: 'Sodio (Na)', unit: 'mEq/L' },
            { key: 'k', label: 'Potasio (K)', unit: 'mEq/L' },
            { key: 'cl', label: 'Cloro (Cl)', unit: 'mEq/L' },
            { key: 'ca', label: 'Calcio (Ca)', unit: 'mg/dL' },
            { key: 'p', label: 'Fósforo (P)', unit: 'mg/dL' },
            { key: 'mg', label: 'Magnesio (Mg)', unit: 'mg/dL' }
        ]
    },
    {
        title: "Coagulación",
        fields: [
            { key: 'pt', label: 'Tiempo de Protrombina (PT)', unit: 'seg' },
            { key: 'ptt', label: 'Tiempo de Tromboplastina (PTT)', unit: 'seg' }
        ]
    }
];

export default function BloodTestsTable({
    data = [],
    loading = false,
    error,
    onAddItem,
    onDeleteItem,
    refetch
}: BloodTestsTableProps) {
    const [bloodTests, setBloodTests] = useState<BloodTest[]>(data);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Sincronizar con los datos del backend
    useEffect(() => {
        if (data) {
            setBloodTests(data);
        }
    }, [data]);

    // React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<BloodTestForm>({
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            hb: '', hto: '', gb: '', neut: '', linf: '', eos: '', plt: '',
            glicemia: '', urea: '', creatinina: '', proteinas_t: '', albumina: '', globulinas: '',
            colesterol: '', trigliceridos: '', ac_urico: '',
            tgo: '', tgp: '', bt: '', bd: '', bi: '',
            na: '', k: '', cl: '', ca: '', p: '', mg: '',
            pt: '', ptt: ''
        }
    });

    // Añadir nuevo: inicializar valores
    const handleAddNew = () => {
        setIsAdding(true);
        reset({
            fecha: new Date().toISOString().split('T')[0],
            hb: '', hto: '', gb: '', neut: '', linf: '', eos: '', plt: '',
            glicemia: '', urea: '', creatinina: '', proteinas_t: '', albumina: '', globulinas: '',
            colesterol: '', trigliceridos: '', ac_urico: '',
            tgo: '', tgp: '', bt: '', bd: '', bi: '',
            na: '', k: '', cl: '', ca: '', p: '', mg: '',
            pt: '', ptt: ''
        });
        setIsDeleteMode(false);
    };

    const onSubmit = async (formData: BloodTestForm) => {
        setIsSubmitting(true);
        try {
            const testData: Omit<BloodTest, 'id'> = {
                fecha: formData.fecha,
                hb: formData.hb,
                hto: formData.hto,
                gb: formData.gb,
                neut: formData.neut,
                linf: formData.linf,
                eos: formData.eos,
                plt: formData.plt,
                glicemia: formData.glicemia,
                urea: formData.urea,
                creatinina: formData.creatinina,
                proteinas_t: formData.proteinas_t,
                albumina: formData.albumina,
                globulinas: formData.globulinas,
                colesterol: formData.colesterol,
                trigliceridos: formData.trigliceridos,
                ac_urico: formData.ac_urico,
                tgo: formData.tgo,
                tgp: formData.tgp,
                bt: formData.bt,
                bd: formData.bd,
                bi: formData.bi,
                na: formData.na,
                k: formData.k,
                cl: formData.cl,
                ca: formData.ca,
                p: formData.p,
                mg: formData.mg,
                pt: formData.pt,
                ptt: formData.ptt
            };

            if (onAddItem) {
                await onAddItem(testData);
                if (refetch) {
                    await refetch();
                }
            }

            setIsAdding(false);
            reset();
            setCurrentPage(1);
        } catch (error) {
            console.error("Error al agregar examen de sangre:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        reset();
    };

    // Toggle modo borrar
    const toggleDeleteMode = () => {
        setIsDeleteMode(prev => !prev);
        setIsAdding(false);
    };

    // Borrar fila individual
    const handleDeleteRow = async (id: string) => {
        setIsDeleting(id);
        try {
            if (onDeleteItem) {
                await onDeleteItem(id);
                if (refetch) {
                    await refetch();
                }
            }

            setIsDeleteMode(false);
            const filtered = applyDateFilter(data);
            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) {
                setCurrentPage(totalPages > 0 ? totalPages : 1);
            }
        } catch (error) {
            console.error("Error al eliminar examen de sangre:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    // Aplicar filtro por rango de fechas
    const applyDateFilter = (tests = bloodTests) => {
        if (!dateFilter.from && !dateFilter.to) return tests;
        return tests.filter(test => {
            const d = new Date(test.fecha);
            const from = dateFilter.from ? new Date(dateFilter.from) : null;
            const to = dateFilter.to ? new Date(dateFilter.to) : null;
            if (from && to) return d >= from && d <= to;
            if (from) return d >= from;
            if (to) return d <= to;
            return true;
        });
    };

    const clearFilter = () => {
        setDateFilter({ from: "", to: "" });
        setCurrentPage(1);
    };

    const filteredTests = applyDateFilter();
    const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);

    const paginatedTests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTests, currentPage]);

    const handlePageChange = (page: number) => {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };

    const fieldGroups = getFieldGroups();

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-600">Cargando exámenes de sangre...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Exámenes de Sangre</h2>
                        <p className="text-red-100 text-sm mt-1">
                            {bloodTests.length} {bloodTests.length === 1 ? 'examen' : 'exámenes'} de sangre
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Añadir Resultados */}
                        {!isAdding && !isDeleteMode && (
                            <Button
                                onClick={handleAddNew}
                                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                                variant="outline"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Examen
                            </Button>
                        )}

                        {/* Filtros */}
                        <Popover open={showFilter} onOpenChange={setShowFilter}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtros
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-4">
                                    <h3 className="font-semibold">Filtrar por fecha</h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Desde:</label>
                                        <input
                                            type="date"
                                            value={dateFilter.from}
                                            onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Hasta:</label>
                                        <input
                                            type="date"
                                            value={dateFilter.to}
                                            onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                clearFilter();
                                                setShowFilter(false);
                                            }}
                                            disabled={!dateFilter.from && !dateFilter.to}
                                        >
                                            Borrar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setCurrentPage(1);
                                                setShowFilter(false);
                                            }}
                                        >
                                            Aplicar
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Eliminar Registro */}
                        {!isAdding && !isDeleteMode && (
                            <Button
                                onClick={toggleDeleteMode}
                                variant="outline"
                                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Indicadores */}
            {(dateFilter.from || dateFilter.to) && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-yellow-600" />
                            <span className="text-yellow-800">
                                Filtrado por fecha: {dateFilter.from || "Inicio"} a {dateFilter.to || "Fin"}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearFilter} className="text-yellow-700 hover:bg-yellow-100">
                            Limpiar filtro
                        </Button>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <Plus className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800">Modo de agregar activo</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="text-blue-700 hover:bg-blue-100">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {isDeleteMode && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-2">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="text-red-800">Modo de borrado activo</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={toggleDeleteMode} className="text-red-700 hover:bg-red-100">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {/* Mostrar error si existe */}
            {error && (
                <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            <span className="text-red-800 font-medium">Error:</span>
                            <span className="text-red-700">{error}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={refetch} className="text-red-700 hover:bg-red-100">
                            Reintentar
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-32">Fecha</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Resultados</th>
                                {(isAdding || isDeleteMode) && (
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-24">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fila para añadir */}
                            {isAdding && (
                                <tr className="border-b border-gray-100 bg-red-50">
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="date"
                                            {...register("fecha", { required: "La fecha es requerida" })}
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.fecha ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                        {errors.fecha && (
                                            <p className="text-red-500 text-xs mt-1">{errors.fecha.message}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-4">
                                            {fieldGroups.map((group, groupIndex) => (
                                                <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">{group.title}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {group.fields.map((field) => (
                                                            <div key={field.key} className="space-y-1">
                                                                <label className="text-xs font-medium text-gray-700">
                                                                    {field.label}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    {...register(field.key as keyof BloodTestForm)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                                    placeholder={field.unit}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Guardar"
                                            >
                                                {isSubmitting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Filas paginadas */}
                            {paginatedTests.map((test) => (
                                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                                        {formatDate(test.fecha)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-4">
                                            {fieldGroups.map((group, groupIndex) => (
                                                <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">{group.title}</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {group.fields.map((field) => (
                                                            <div key={field.key} className="space-y-1">
                                                                <div className="text-xs font-medium text-gray-700">
                                                                    {field.label}
                                                                </div>
                                                                <div className="text-sm text-gray-900 font-medium">
                                                                    {formatValue(test[field.key as keyof BloodTest])} {field.unit}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    {(isAdding || isDeleteMode) && (
                                        <td className="px-6 py-4">
                                            {isDeleteMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRow(test.id)}
                                                    disabled={isDeleting === test.id}
                                                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Borrar registro"
                                                >
                                                    {isDeleting === test.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm">Borrar</span>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {/* Si no hay resultados */}
                            {paginatedTests.length === 0 && !isAdding && (
                                <tr>
                                    <td
                                        colSpan={isAdding || isDeleteMode ? 3 : 2}
                                        className="px-6 py-6 text-center text-sm text-gray-500"
                                    >
                                        No hay exámenes de sangre para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </form>
            </div>

            {/* Footer con paginación */}
            <div className="border-t border-gray-200">
                <TableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTests.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                    showingText="Mostrando"
                />
            </div>
        </div>
    );
}