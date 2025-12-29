import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    FolderOpen, UserPlus, Database, RefreshCw, Trash2, Calendar, Download, Upload,
    Shield, AlertTriangle, Eye, EyeOff, CheckCircle, Users, Save, HardDrive, Loader2, FileUp
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/services/paciente.api";

// 1. Esquema de Validación (Zod)
const userSchema = z.object({
    username: z.string().min(4, "El usuario debe tener al menos 4 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    question: z.string().min(1, "Selecciona una pregunta"),
    answer: z.string().min(1, "La respuesta es obligatoria"),
});

type UserFormData = z.infer<typeof userSchema>;

const SECURITY_QUESTIONS = [
    "¿Cuál es el apellido de soltera de tu madre?",
    "¿Cuál fue el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es tu libro favorito?",
    "¿Cuál era tu apodo de infancia?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿Cuál es tu película favorita?",
    "¿En qué escuela primaria estudiaste?"
];

export default function SettingsPage() {
    // --- ESTADOS BACKUP ---
    const [backupPath, setBackupPath] = useState("C:\\respaldo_nefro\\backup\\");
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);

    // --- ESTADOS RESTAURACIÓN (CORREGIDO PARA ARCHIVOS) ---
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // <--- Guardamos el archivo
    const [isRestoring, setIsRestoring] = useState(false);
    const [confirmRestoreModal, setConfirmRestoreModal] = useState(false);
    const [restoreSuccess, setRestoreSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // <--- Referencia al input oculto

    // --- ESTADOS USUARIO ---
    const [openAddUserModal, setOpenAddUserModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userSuccess, setUserSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [usersList, setUsersList] = useState<{ usuario: string; pregunta_seguridad: string }[]>([]);
    const [showListModal, setShowListModal] = useState(false);
    const [loadingList, setLoadingList] = useState(false);

    // --- ESTADOS DB ---
    const [confirmDeleteDB, setConfirmDeleteDB] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState("");
    const [isDeletingDB, setIsDeletingDB] = useState(false);

    // Configuración del Formulario
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: "",
            password: "",
            question: "",
            answer: ""
        }
    });

    // --- FUNCIONES ---

    // 1. Selector de Archivos (NUEVO)
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const checkLastBackup = async () => {
        // Solo buscamos si hay una ruta escrita
        if (!backupPath) return;

        try {
            const response = await api.post("/backup/last", { path: backupPath });
            if (response.data.success) {
                setLastBackup(response.data.lastBackup); // Puede ser la fecha o null
            }
        } catch (error) {
            console.error("Error consultando último respaldo", error);
            setLastBackup(null);
        }
    };

    // Usamos useEffect para consultar cada vez que cambie la ruta (con un pequeño delay para no saturar al escribir)
    useEffect(() => {
        const timer = setTimeout(() => {
            checkLastBackup();
        }, 800); // Espera 800ms después de que dejes de escribir

        return () => clearTimeout(timer);
    }, [backupPath]);

    const handleRestore = async () => {
        if (!selectedFile) return;

        setIsRestoring(true);
        setApiError(null);

        const formData = new FormData();
        // ESTE NOMBRE "backupFile" DEBE SER IGUAL AL DEL BACKEND (upload.single("backupFile"))
        formData.append("backupFile", selectedFile);

        try {
            // AGREGAMOS EL HEADER EXPLÍCITAMENTE
            const response = await api.post("/restore", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                setRestoreSuccess(true);
                setTimeout(() => {
                    setConfirmRestoreModal(false);
                    setRestoreSuccess(false);
                    setSelectedFile(null);
                    alert("¡Sistema restaurado exitosamente! Por favor recarga la página.");
                    window.location.reload();
                }, 2000);
            }
        } catch (err: any) {
            console.error(err);
            // Mejora en la captura del mensaje de error
            const serverMsg = err.response?.data?.error;
            setApiError(serverMsg || "Error al restaurar la base de datos");
        } finally {
            setIsRestoring(false);
        }
    };

    // 3. Obtener Lista de Usuarios
    const handleFetchUsers = async () => {
        setLoadingList(true);
        setShowListModal(true);
        try {
            const response = await api.get("/users");
            if (response.data.success) {
                setUsersList(response.data.data);
            }
        } catch (error) {
            console.error("Error cargando usuarios", error);
        } finally {
            setLoadingList(false);
        }
    };

    // 4. Crear Respaldo (Backup)
    const simulateBackupProgress = () => {
        setIsCreatingBackup(true);
        setBackupProgress(0);
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
        return interval;
    };

    const handleBackup = async () => {
        const interval = simulateBackupProgress();
        try {
            const response = await api.post("/backup", { path: backupPath });
            if (response.data.success) {
                setLastBackup(new Date().toLocaleString());
                // Forzamos el progreso al 100% visualmente al terminar
                setBackupProgress(100);
                checkLastBackup();
                setTimeout(() => {
                    alert("Respaldo creado correctamente en: " + response.data.path);
                    setIsCreatingBackup(false);
                }, 500);
            }
        } catch (err: any) {
            console.error(err);
            setIsCreatingBackup(false);
            alert("Error: " + (err.response?.data?.error || "Falló el respaldo"));
        } finally {
            clearInterval(interval);
        }
    };

    // 5. Registrar usuario (Submit)
    const onSubmitUser = async (data: UserFormData) => {
        setApiError(null);
        try {
            const response = await api.post("/register", {
                username: data.username,
                password: data.password,
                question: data.question,
                answer: data.answer
            });

            if (response.data.success) {
                setUserSuccess(true);
                setTimeout(() => {
                    setOpenAddUserModal(false);
                    setUserSuccess(false);
                    reset();
                }, 1500);
            }

        } catch (error: any) {
            console.error("Error creando usuario:", error);
            const msg = error.response?.data?.error || "Error al conectar con el servidor";
            setApiError(msg);
        }
    };

    const handleCloseModal = (open: boolean) => {
        if (!open) {
            reset();
            setApiError(null);
            setUserSuccess(false);
        }
        setOpenAddUserModal(open);
    };

    // 6. Eliminar base de datos
    const handleDeleteDatabase = async () => {
        if (confirmDeleteText !== "ELIMINAR") return;

        setIsDeletingDB(true);
        try {
            await api.delete("/database");
            setTimeout(() => {
                setConfirmDeleteDB(false);
                setConfirmDeleteText("");
                setIsDeletingDB(false);
                alert("Base de datos eliminada.");
            }, 2000);
        } catch (error) {
            console.error(error);
            setIsDeletingDB(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">

            {/* Grid de configuraciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- Tarjeta de Respaldo --- */}
                <Card className="border-2 p-0 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    {/* CAMBIOS REALIZADOS:
       1. En <Card>: Agregué 'overflow-hidden'. Esto hace que el header corte perfectamente en las esquinas redondeadas.
       2. En <CardHeader>: Asegúrate de que tenga 'p-6' (padding) para que el texto no pegue con los bordes, 
          pero el color de fondo sí llegue hasta el final.
    */}
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Database className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-blue-800">Respaldo de Base de Datos</CardTitle>
                                    <CardDescription>Protege tus datos con copias de seguridad</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Save className="w-3 h-3 mr-1" />
                                Seguridad
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-700 font-medium">Ruta de guardado</Label>
                                <Badge variant="secondary" className="text-xs">
                                    <FolderOpen className="w-3 h-3 mr-1" />
                                    Personalizable
                                </Badge>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="C:\respaldo_nefro\backup\"
                                        value={backupPath}
                                        onChange={(e) => setBackupPath(e.target.value)}
                                        className="pl-10 pr-4 py-3 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400"
                                    onClick={() => setBackupPath("C:\\respaldo_nefro\\backup\\")}
                                >
                                    Seleccionar
                                </Button>
                            </div>
                        </div>

                        {/* Último respaldo */}
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">Último respaldo:</span>
                            </div>
                            <div className="flex items-center justify-between">
                                {lastBackup ? (
                                    <>
                                        <span className="font-semibold text-green-700">{lastBackup}</span>
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Completado
                                        </Badge>
                                    </>
                                ) : (
                                    <span className="text-gray-400 italic">No se han realizado respaldos</span>
                                )}
                            </div>
                        </div>

                        {isCreatingBackup && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Creando respaldo...</span>
                                    <span>{backupProgress}%</span>
                                </div>
                                <Progress value={backupProgress} className="h-2" />
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="border-t border-gray-100 pt-6 pb-5">
                        <Button
                            onClick={handleBackup}
                            disabled={isCreatingBackup || !backupPath}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 padding-do hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            {isCreatingBackup ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Generar Respaldo
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* --- Tarjeta de Usuarios --- */}
                <Card className="border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden p-0">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Users className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-emerald-800">Gestión de Usuarios</CardTitle>
                                    <CardDescription>Administra el acceso al sistema</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                                <Shield className="w-3 h-3 mr-1" />
                                Acceso
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200">
                                <div>
                                    <p className="font-medium text-gray-800">Usuarios activos</p>
                                    <p className="text-sm text-gray-600">Administra permisos y acceso</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                    onClick={handleFetchUsers}
                                >
                                    Ver lista
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t border-gray-100 pt-6">
                        <Button
                            onClick={() => setOpenAddUserModal(true)}
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Agregar Nuevo Usuario
                        </Button>
                    </CardFooter>
                </Card>

                {/* --- Tarjeta de Zona Peligrosa --- */}
                <Card className="lg:col-span-2 border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden p-0">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-red-800">Zona de Alto Riesgo</CardTitle>
                                    <CardDescription className="text-red-600">Acciones irreversibles - Proceder con extrema precaución</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Peligro
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 pb-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* 1. Eliminar DB */}
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <HardDrive className="w-4 h-4 text-red-600" />
                                    <h3 className="font-semibold text-red-800">Eliminar Base de Datos</h3>
                                </div>
                                <p className="text-sm text-red-700 mb-4">
                                    Elimina todos los pacientes, historiales médicos, usuarios y configuración del sistema.
                                </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setConfirmDeleteDB(true)}
                                    className="w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar Base de Datos
                                </Button>
                            </div>

                            {/* 2. Restaurar DB (CON SELECTOR DE ARCHIVO) */}
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="w-4 h-4 text-orange-600" />
                                    <h3 className="font-semibold text-orange-800">Restaurar Sistema</h3>
                                </div>
                                <p className="text-sm text-orange-700 mb-4">
                                    Restaura el sistema seleccionando un archivo de respaldo (.sql).
                                </p>

                                {/* Input Oculto */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".sql,.backup"
                                    onChange={handleFileSelect}
                                />

                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full border-orange-300 text-orange-700 bg-white hover:bg-orange-50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FolderOpen className="w-4 h-4 mr-2" /> {selectedFile ? "Cambiar Archivo" : "Seleccionar Archivo"}
                                    </Button>

                                    {selectedFile && (
                                        <div className="text-xs text-center text-orange-800 font-medium bg-orange-100 p-2 rounded truncate">
                                            Archivo: {selectedFile.name}
                                        </div>
                                    )}

                                    <Button
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                                        onClick={() => setConfirmRestoreModal(true)}
                                        disabled={!selectedFile}
                                    >
                                        <Upload className="w-4 h-4 mr-2" /> Restaurar Ahora
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- MODALES --- */}

            {/* 1. Modal Usuario (React Hook Form) */}
            <Dialog open={openAddUserModal} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-md border-2 border-emerald-100">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <UserPlus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-emerald-800">Agregar Nuevo Usuario</DialogTitle>
                                <DialogDescription>Complete todos los campos para crear un nuevo usuario.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {userSuccess && <Alert className="bg-emerald-50 text-emerald-800 mb-4"><CheckCircle className="h-4 w-4" /><AlertDescription>¡Usuario creado exitosamente!</AlertDescription></Alert>}
                    {apiError && <Alert variant="destructive" className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertDescription>{apiError}</AlertDescription></Alert>}

                    <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="username">Usuario</Label>
                            <Input id="username" placeholder="ej: enfermero01" className={errors.username ? "border-red-500" : ""} {...register("username")} />
                            {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" className={`pr-10 ${errors.password ? "border-red-500" : ""}`} {...register("password")} />
                                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</Button>
                            </div>
                            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Pregunta de Seguridad</Label>
                            <Controller name="question" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className={errors.question ? "border-red-500" : ""}><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                                    <SelectContent>{SECURITY_QUESTIONS.map((q, i) => (<SelectItem key={i} value={q}>{q}</SelectItem>))}</SelectContent>
                                </Select>
                            )} />
                            {errors.question && <span className="text-xs text-red-500">{errors.question.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="answer">Respuesta</Label>
                            <Input id="answer" placeholder="Tu respuesta secreta" className={errors.answer ? "border-red-500" : ""} {...register("answer")} />
                            {errors.answer && <span className="text-xs text-red-500">{errors.answer.message}</span>}
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => handleCloseModal(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando...</> : <><UserPlus className="w-4 h-4 mr-2" /> Crear Usuario</>}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* 2. Modal Lista Usuarios */}
            <Dialog open={showListModal} onOpenChange={setShowListModal}>
                <DialogContent className="sm:max-w-lg border-2 border-emerald-100">
                    <DialogHeader>
                        <DialogTitle className="text-emerald-800">Usuarios Registrados</DialogTitle>
                        <DialogDescription>Listado del personal con acceso al sistema.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
                        {loadingList ? <div className="text-center py-4"><Loader2 className="animate-spin w-6 h-6 mx-auto text-emerald-600" /><p>Cargando lista...</p></div> :
                            usersList.length > 0 ? <div className="space-y-3">{usersList.map((u, i) => (
                                <div key={i} className="flex justify-between p-3 bg-slate-50 border rounded-lg">
                                    <div className="flex gap-3 items-center"><div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">{u.usuario.charAt(0).toUpperCase()}</div><p className="font-semibold">{u.usuario}</p></div>
                                    <div className="text-sm text-gray-500 bg-white px-2 py-1 border rounded">{u.pregunta_seguridad}</div>
                                </div>))}</div> : <p className="text-center text-gray-500">No hay usuarios.</p>}
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowListModal(false)}>Cerrar</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. Modal Restaurar (CONFIRMACIÓN) */}
            <Dialog open={confirmRestoreModal} onOpenChange={setConfirmRestoreModal}>
                <DialogContent className="sm:max-w-md border-2 border-orange-200">
                    <DialogHeader>
                        <DialogTitle className="text-orange-800 flex items-center gap-2"><RefreshCw className="w-5 h-5" /> Confirmar Restauración</DialogTitle>
                        <DialogDescription>Se usará el archivo: <strong>{selectedFile?.name}</strong></DialogDescription>
                    </DialogHeader>
                    {restoreSuccess && <Alert className="bg-green-50 text-green-800"><CheckCircle className="h-4 w-4" /><AlertDescription>¡Restauración completada!</AlertDescription></Alert>}
                    {apiError && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{apiError}</AlertDescription></Alert>}
                    <Alert className="bg-orange-50 text-orange-800 border-orange-200 mt-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Advertencia</AlertTitle><AlertDescription>Los datos actuales se perderán permanentemente.</AlertDescription></Alert>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setConfirmRestoreModal(false)}>Cancelar</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleRestore} disabled={isRestoring}>
                            {isRestoring ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Restaurando...</> : <><FileUp className="w-4 h-4 mr-2" /> Confirmar</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 4. Modal Eliminar DB */}
            <Dialog open={confirmDeleteDB} onOpenChange={setConfirmDeleteDB}>
                <DialogContent className="sm:max-w-md border-2 border-red-100">
                    <DialogHeader><DialogTitle className="text-red-800">Eliminación Total</DialogTitle><DialogDescription>Escribe "ELIMINAR" para confirmar.</DialogDescription></DialogHeader>
                    <Input value={confirmDeleteText} onChange={(e) => setConfirmDeleteText(e.target.value)} className="border-red-300" />
                    <DialogFooter><Button variant="outline" onClick={() => setConfirmDeleteDB(false)}>Cancelar</Button><Button variant="destructive" onClick={handleDeleteDatabase} disabled={confirmDeleteText !== "ELIMINAR" || isDeletingDB}>{isDeletingDB ? "Eliminando..." : "Eliminar Permanentemente"}</Button></DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}