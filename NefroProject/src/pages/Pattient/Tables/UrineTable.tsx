import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Save, Trash2, Filter, Calendar, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TableFooter } from "@/components/custom/TableFooter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/helpers/formatDate";

// Interface para los datos de orina desde el backend
export interface UrineTest {
    id: string;
    fecha: string; // Cambiado de 'date' a 'fecha'
    ph: string;    // Cambiado de 'pH' a 'ph'
    proteinas: string;
    hemoglobina: boolean;
    glucosa: string;
    leuco: string;
    hematies: string;
    celulas: string;
    bacterias: boolean;
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

export default function UrineTestsTable({
    data = [],
    loading = false,
    onAddItem,
    onDeleteItem,
    refetch
}: TableProps) {
    const [urineTests, setUrineTests] = useState<UrineTest[]>(data);
    const [isAdding, setIsAdding] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Sincronizar con los datos del backend
    useEffect(() => {
        if (data) {
            setUrineTests(data);
        }
    }, [data]);

    const { register, handleSubmit, reset, setValue, watch } = useForm<UrineTest>({
        defaultValues: {
            fecha: new Date().toISOString().split("T")[0],
            ph: "",
            proteinas: "Negativo",
            hemoglobina: false,
            glucosa: "Negativo",
            leuco: "",
            hematies: "",
            celulas: "",
            bacterias: false,
        },
    });

    const onSubmit = async (formData: UrineTest) => {
        setIsSubmitting(true);
        try {
            const testData: Omit<UrineTest, 'id'> = {
                fecha: formData.fecha,
                ph: formData.ph,
                proteinas: formData.proteinas,
                hemoglobina: formData.hemoglobina,
                glucosa: formData.glucosa,
                leuco: formData.leuco,
                hematies: formData.hematies,
                celulas: formData.celulas,
                bacterias: formData.bacterias,
            };

            if (onAddItem) {
                await onAddItem(testData);
                if (refetch) {
                    await refetch();
                }
            } else {
                console.warn("No hay función onAddTest proporcionada");
            }

            setIsAdding(false);
            reset();
            setCurrentPage(1);
        } catch (error) {
            console.error("Error al agregar test:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        reset();
    };

    const handleDeleteRow = async (id: string) => {
        setIsDeleting(id);
        try {
            if (onDeleteItem) {
                await onDeleteItem(id);
                if (refetch) {
                    await refetch();
                }
            } else {
                console.warn("No hay función onDeleteTest proporcionada");
            }

            setIsDeleteMode(false);
            const filtered = applyDateFilter(data);
            const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) {
                setCurrentPage(totalPages > 0 ? totalPages : 1);
            }
        } catch (error) {
            console.error("Error al eliminar test:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
    };

    const applyDateFilter = (tests = urineTests) => {
        if (!dateFilter.from && !dateFilter.to) {
            return tests;
        }

        return tests.filter(test => {
            const testDate = new Date(test.fecha);
            const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
            const toDate = dateFilter.to ? new Date(dateFilter.to) : null;

            if (fromDate && toDate) {
                return testDate >= fromDate && testDate <= toDate;
            } else if (fromDate) {
                return testDate >= fromDate;
            } else if (toDate) {
                return testDate <= toDate;
            }
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
        setCurrentPage(page);
    };

    const autoGrow = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.target.size = e.target.value.length > 0 ? e.target.value.length : 1;
    };

    const headers = [
        "Fecha",
        "pH",
        "Proteínas",
        "Hemoglobina",
        "Glucosa",
        "Leucocitos",
        "Hematíes",
        "Células",
        "Bacterias",
    ];

    if (isDeleteMode || isAdding) {
        headers.push("Acciones");
    }

    const hemoglobinaValue = watch("hemoglobina");
    const bacteriasValue = watch("bacterias");

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando exámenes de orina...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Test de Orina</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {urineTests.length} {urineTests.length === 1 ? 'registro' : 'registros'} encontrados
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {!isAdding && !isDeleteMode && (
                            <Button
                                onClick={() => setIsAdding(true)}
                                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                                variant="outline"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Añadir Resultados
                            </Button>
                        )}

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
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Hasta:</label>
                                        <input
                                            type="date"
                                            value={dateFilter.to}
                                            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
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

                        {!isAdding && !isDeleteMode && (
                            <Button
                                onClick={toggleDeleteMode}
                                variant="outline"
                                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Registro
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Indicadores de estado */}
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
                                {headers.map((header, index) => (
                                    <th key={index} className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isAdding && (
                                <tr className="border-b border-gray-100 bg-green-50">
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="date"
                                            {...register("fecha")}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            {...register("ph")}
                                            placeholder="pH"
                                            onChange={autoGrow}
                                            size={1}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <Select onValueChange={(val) => setValue("proteinas", val)} defaultValue="Negativo">
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Proteínas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Negativo">Negativo</SelectItem>
                                                <SelectItem value="Trazas">Trazas</SelectItem>
                                                <SelectItem value="Positivo +">Positivo +</SelectItem>
                                                <SelectItem value="Positivo ++">Positivo ++</SelectItem>
                                                <SelectItem value="Positivo +++">Positivo +++</SelectItem>
                                                <SelectItem value="Positivo ++++">Positivo ++++</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={hemoglobinaValue === true}
                                                onChange={(e) => setValue("hemoglobina", e.target.checked ? true : false)}
                                            />
                                            <span className="text-sm">Positivo</span>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <Select onValueChange={(val) => setValue("glucosa", val)} defaultValue="Negativo">
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Glucosa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Negativo">Negativo</SelectItem>
                                                <SelectItem value="Trazas">Trazas</SelectItem>
                                                <SelectItem value="Positivo +">Positivo +</SelectItem>
                                                <SelectItem value="Positivo ++">Positivo ++</SelectItem>
                                                <SelectItem value="Positivo +++">Positivo +++</SelectItem>
                                                <SelectItem value="Positivo ++++">Positivo ++++</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            {...register("leuco")}
                                            placeholder="Leucocitos"
                                            onChange={autoGrow}
                                            size={1}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            {...register("hematies")}
                                            placeholder="Hematíes"
                                            onChange={autoGrow}
                                            size={1}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <input
                                            type="text"
                                            {...register("celulas")}
                                            placeholder="Células"
                                            onChange={autoGrow}
                                            size={1}
                                            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={bacteriasValue === true}
                                                onChange={(e) => setValue("bacterias", e.target.checked ? true : false)}
                                            />
                                            <span className="text-sm">Positivo</span>
                                        </label>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Guardar"
                                            >
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {paginatedTests.map((test) => (
                                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">{formatDate(test.fecha)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.ph}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.proteinas}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.hemoglobina === true ? "Positivo" : "Negativo"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.glucosa}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.leuco}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.hematies}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.celulas}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 align-top">{test.bacterias === true ? "Positivo" : "Negativo"}</td>
                                    {(isDeleteMode || isAdding) && (
                                        <td className="px-6 py-4 align-top">
                                            {isDeleteMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRow(test.id)}
                                                    disabled={isDeleting === test.id}
                                                    className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Borrar registro"
                                                >
                                                    {isDeleting === test.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    <span className="text-sm">Borrar</span>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {paginatedTests.length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan={headers.length} className="px-6 py-6 text-center text-sm text-gray-500">
                                        No hay registros para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </form>
            </div>

            {/* Footer con paginación */}
            <TableFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTests.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                showingText="Mostrando"
            />
        </div>
    );
}