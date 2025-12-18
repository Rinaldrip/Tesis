import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Filter, Calendar, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TableFooter } from "@/components/custom/TableFooter";
import { formatDate } from "@/helpers/formatDate";

/* ------------------ TratamientoTable ------------------ */
export interface Tratamiento {
    id: string;
    fecha: string;
    tratamiento: string; // Cambiado de 'orden' a 'tratamiento'
}

interface TratamientoForm {
    fecha: string;
    tratamiento: string; // Cambiado de 'orden' a 'tratamiento'
}

// En cada archivo de tabla (UrineTable.tsx, MedicalOrderTable.tsx, etc.)
interface TableProps {
    data: any[];
    loading?: boolean;
    error?: string;
    onAddItem?: (item: any) => Promise<void>;
    onDeleteItem?: (id: string) => Promise<void>;
    refetch?: () => Promise<void>; // Función específica para recargar esta tabla
}

const ITEMS_PER_PAGE = 5;

export default function TratamientoTable({
    data = [],
    loading = false,
    onAddItem,
    onDeleteItem,
    refetch
}: TableProps) {
    const [tratamientos, setTratamientos] = useState<Tratamiento[]>(data);
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
            setTratamientos(data);
        }
    }, [data]);

    // React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<TratamientoForm>({
        defaultValues: {
            fecha: new Date().toISOString().split("T")[0],
            tratamiento: ""
        }
    });

    // Añadir nuevo: inicializar valores
    const handleAddNew = () => {
        setIsAdding(true);
        reset({
            fecha: new Date().toISOString().split("T")[0],
            tratamiento: ""
        });
        setIsDeleteMode(false);
    };

    const onSubmit = async (formData: TratamientoForm) => {
        if (!formData.fecha || !formData.tratamiento.trim()) return;

        setIsSubmitting(true);
        try {
            const tratamientoData: Omit<Tratamiento, 'id'> = {
                fecha: formData.fecha,
                tratamiento: formData.tratamiento.trim()
            };

            if (onAddItem) {
                await onAddItem(tratamientoData);
                if (refetch) {
                    await refetch();
                }
            } else {
                console.warn("No hay función onAddTratamiento proporcionada");
            }
            setIsAdding(false);
            reset();
            setCurrentPage(1);
        } catch (error) {
            console.error("Error al agregar tratamiento:", error);
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
            } else {
                console.warn("No hay función onDeleteTratamiento proporcionada");
            }

            setIsDeleteMode(false);
            const filtered = applyDateFilter(data);
            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) {
                setCurrentPage(totalPages > 0 ? totalPages : 1);
            }
        } catch (error) {
            console.error("Error al eliminar tratamiento:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    // Aplicar filtro por rango de fechas
    const applyDateFilter = (tratamientosList = tratamientos) => {
        if (!dateFilter.from && !dateFilter.to) return tratamientosList;
        return tratamientosList.filter(tratamiento => {
            const d = new Date(tratamiento.fecha);
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

    const filteredTratamientos = applyDateFilter();
    const totalPages = Math.ceil(filteredTratamientos.length / ITEMS_PER_PAGE);

    const paginatedTratamientos = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTratamientos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTratamientos, currentPage]);

    const handlePageChange = (page: number) => {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    <span className="ml-2 text-gray-600">Cargando tratamientos...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Tratamiento</h2>
                        <p className="text-green-100 text-sm mt-1">
                            {tratamientos.length} {tratamientos.length === 1 ? 'tratamiento' : 'tratamientos'} registrados
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
                                Nuevo Tratamiento
                            </Button>
                        )}

                        {/* Filtros (Popover con rango) */}
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

                        {/* Eliminar Registro (toggle) */}
                        {!isAdding && !isDeleteMode && (
                            <Button
                                onClick={toggleDeleteMode}
                                variant="outline"
                                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Tratamiento
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

            {/* Tabla */}
            <div className="overflow-x-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-32">Fecha</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Tratamiento</th>
                                {(isAdding || isDeleteMode) && (
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800 w-24">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fila para añadir */}
                            {isAdding && (
                                <tr className="border-b border-gray-100 bg-green-50">
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="date"
                                            {...register("fecha", {
                                                required: "La fecha es requerida"
                                            })}
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fecha ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                        {errors.fecha && (
                                            <p className="text-red-500 text-xs mt-1">{errors.fecha.message}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <textarea
                                            {...register("tratamiento", {
                                                required: "El tratamiento es requerido",
                                                minLength: {
                                                    value: 10,
                                                    message: "El tratamiento debe tener al menos 10 caracteres"
                                                }
                                            })}
                                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] resize-vertical ${errors.tratamiento ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Ingrese el tratamiento o instrucción médica..."
                                        />
                                        {errors.tratamiento && (
                                            <p className="text-red-500 text-xs mt-1">{errors.tratamiento.message}</p>
                                        )}
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
                            {paginatedTratamientos.map(tratamiento => (
                                <tr key={tratamiento.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">{formatDate(tratamiento.fecha)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 leading-relaxed align-top">
                                        <div className="whitespace-pre-wrap break-words max-w-260">
                                            {tratamiento.tratamiento}
                                        </div>
                                    </td>

                                    {(isAdding || isDeleteMode) && (
                                        <td className="px-6 py-4">
                                            {isDeleteMode ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRow(tratamiento.id)}
                                                    disabled={isDeleting === tratamiento.id}
                                                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Borrar registro"
                                                >
                                                    {isDeleting === tratamiento.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm">Borrar</span>
                                                </button>
                                            ) : null}
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {/* Si no hay resultados */}
                            {paginatedTratamientos.length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan={(isAdding || isDeleteMode) ? 3 : 2} className="px-6 py-6 text-center text-sm text-gray-500">
                                        No hay tratamientos para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </form>
            </div>

            {/* Footer con paginación y acciones */}
            <div className="border-t border-gray-200">
                <TableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredTratamientos.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                    showingText="Mostrando"
                />
            </div>
        </div>
    );
}