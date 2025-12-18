import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Plus, Search, SortAsc, X } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface SearchCustomProps {
    onAddPatient?: () => void;
    onSearch?: (term: string) => void;
    onSort?: (field: SortOption, direction: SortDirection) => void;
    searchTerm?: string;
    currentSort?: {
        field: SortOption;
        direction: SortDirection;
    };
    onFilterChange?: (key: string, value: string) => void;
}

type SortOption = 'nombre' | 'cedula' | 'estado' | 'fecha-ingreso';
type SortDirection = 'asc' | 'desc';

export const SearchCustom = ({
    onAddPatient,
    onSearch,
    onSort,
    searchTerm = "",
    currentSort,
    onFilterChange
}: SearchCustomProps) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [activeAcordion, setActiveAcordion] = useState<string>('');
    const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sincronizar el término de búsqueda local con el prop
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    const handleSearchChange = (value: string) => {
        setLocalSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const value = inputRef.current?.value ?? '';
            handleSearchChange(value);
        }
    };

    const handleClearSearch = () => {
        setLocalSearchTerm("");
        if (onSearch) {
            onSearch("");
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleAddPatient = () => {
        if (onAddPatient) {
            onAddPatient();
        }
    };

    const toggleAccordion = () => {
        setActiveAcordion(prev => prev === 'advance-filters' ? '' : 'advance-filters');
    };

    const clearFilters = () => {
        // Aquí puedes agregar lógica para limpiar filtros avanzados
        console.log('Limpiar filtros avanzados');
    };

    const handleSort = (field: SortOption) => {
        if (onSort) {
            if (currentSort && currentSort.field === field) {
                const newDirection = currentSort.direction === "asc" ? "desc" : "asc";
                onSort(field, newDirection);
            } else {
                onSort(field, "asc");
            }
        }
        setSortPopoverOpen(false);
    };

    const getSortButtonText = () => {
        if (!currentSort) return "Ordenar por...";
        const fieldNames = {
            nombre: "Nombre",
            cedula: "Cédula",
            estado: "Estado",
            "fecha-ingreso": "Fecha Ingreso"
        };
        const direction = currentSort.direction === "asc" ? "↑" : "↓";
        return `${fieldNames[currentSort.field]} ${direction}`;
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                        ref={inputRef}
                        placeholder="Buscar pacientes por nombre, cédula, enfermedad o estado..."
                        className="pl-12 pr-10 h-12 text-lg bg-white"
                        value={localSearchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {localSearchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <Button
                        variant={activeAcordion === 'advance-filters' ? 'default' : 'outline'}
                        className="h-12 cursor-pointer"
                        onClick={toggleAccordion}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtros
                    </Button>

                    <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-12 cursor-pointer"
                                onClick={() => setSortPopoverOpen(!sortPopoverOpen)}
                            >
                                <SortAsc className="h-4 w-4 mr-2" />
                                {getSortButtonText()}
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-48">
                            <div className="flex flex-col">
                                {['nombre', 'cedula', 'estado', 'fecha-ingreso'].map((field) => (
                                    <button
                                        key={field}
                                        className={`text-left px-4 py-2 hover:bg-gray-100 cursor-pointer ${currentSort?.field === field ? 'bg-blue-50 text-blue-700' : ''
                                            }`}
                                        onClick={() => handleSort(field as SortOption)}
                                    >
                                        {field === 'nombre' && 'Nombre'}
                                        {field === 'cedula' && 'Cédula'}
                                        {field === 'estado' && 'Estado'}
                                        {field === 'fecha-ingreso' && 'Fecha de Ingreso'}
                                        {currentSort?.field === field && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        className="h-12 cursor-pointer bg-blue-900 text-white hover:bg-blue-800"
                        onClick={handleAddPatient}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Paciente
                    </Button>
                </div>
            </div>

            <Accordion type="single" collapsible value={activeAcordion}>
                <AccordionItem value="advance-filters">
                    <AccordionContent>
                        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Filtros Avanzados</h3>
                                <Button
                                    variant="ghost"
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={clearFilters}
                                >
                                    Limpiar Filtros
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Diálisis</label>
                                    <Select onValueChange={(value) => onFilterChange?.("dialisis", value)}
                                    >
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Diálisis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Peritonial">D. Peritonial</SelectItem>
                                            <SelectItem value="Hemodialisis">Hemodiálisis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estado del Paciente</label>
                                    <Select onValueChange={(value) => onFilterChange?.("estado", value)}
                                    >
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Todos los Estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Estable">Estable</SelectItem>
                                            <SelectItem value="Mejorando">Mejorando</SelectItem>
                                            <SelectItem value="Critico">Crítico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Hipertensión</label>
                                    <Select onValueChange={(value) => onFilterChange?.("hipertension", value)}>
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Todos los pacientes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">Hipertenso</SelectItem>
                                            <SelectItem value="false">Sin Hipertensión</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Acceso Vascular</label>
                                    <Select onValueChange={(value) => onFilterChange?.("acceso_vascular", value)}>
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Acceso Vascular" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Fistula">Fístula VA</SelectItem>
                                            <SelectItem value="cateter-per">Cateter Permacath</SelectItem>
                                            <SelectItem value="Cateter">Cateter Temporal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    )
}