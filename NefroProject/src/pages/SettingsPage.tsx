import { useState } from "react";
import {
    FolderOpen,
    UserPlus,
    Database,
    RefreshCw,
    Trash2,
    Calendar,
    Download,
    Upload,
    Shield,
    Key,
    AlertTriangle,
    Eye,
    EyeOff,
    CheckCircle,
    X,
    Users,
    Save,
    HardDrive
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
    const [backupPath, setBackupPath] = useState("");
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);

    const [openAddUserModal, setOpenAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        question: "",
        answer: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [userSuccess, setUserSuccess] = useState(false);

    const [confirmDeleteDB, setConfirmDeleteDB] = useState(false);
    const [confirmDeleteText, setConfirmDeleteText] = useState("");
    const [isDeletingDB, setIsDeletingDB] = useState(false);

    // Simular progreso de respaldo
    const simulateBackupProgress = () => {
        setIsCreatingBackup(true);
        setBackupProgress(0);

        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsCreatingBackup(false);
                    setLastBackup(new Date().toLocaleString());
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    // Crear respaldo
    const handleBackup = async () => {
        try {
            simulateBackupProgress();
            const response = await api.post("/backup", { path: backupPath });
            // Simular éxito después de la llamada real
            setTimeout(() => {
                setLastBackup(new Date().toLocaleString());
                setIsCreatingBackup(false);
            }, 1000);
        } catch (err) {
            console.error(err);
            setIsCreatingBackup(false);
        }
    };

    // Registrar usuario
    const handleAddUser = async () => {
        try {
            const response = await api.post("/register", {
                username: newUser.username,
                password: newUser.password,
                securityQuestion: newUser.question,
                securityAnswer: newUser.answer,
            });

            setUserSuccess(true);
            setTimeout(() => {
                setOpenAddUserModal(false);
                setUserSuccess(false);
                setNewUser({ username: "", password: "", question: "", answer: "" });
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    // Eliminar base de datos
    const handleDeleteDatabase = async () => {
        if (confirmDeleteText !== "ELIMINAR") {
            return;
        }

        setIsDeletingDB(true);
        try {
            await api.delete("/database");
            setTimeout(() => {
                setConfirmDeleteDB(false);
                setConfirmDeleteText("");
                setIsDeletingDB(false);
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
                {/* Tarjeta de Respaldo */}
                <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
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
                        {/* Ruta de guardado */}
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
                                        placeholder="C:/respaldo_nefro/backup_2024/"
                                        value={backupPath}
                                        onChange={(e) => setBackupPath(e.target.value)}
                                        className="pl-10 pr-4 py-3 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                    <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-400"
                                    onClick={() => setBackupPath("C:/Backups/NefroDB/")}
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

                        {/* Progreso del respaldo */}
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

                    <CardFooter className="border-t border-gray-100 pt-6">
                        <Button
                            onClick={handleBackup}
                            disabled={isCreatingBackup || !backupPath}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            {isCreatingBackup ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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

                {/* Tarjeta de Usuarios */}
                <Card className="border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200">
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

                {/* Tarjeta de Zona Peligrosa */}
                <Card className="lg:col-span-2 border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
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

                    <CardContent className="pt-6">
                        <Alert variant="destructive" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>¡Advertencia Crítica!</AlertTitle>
                            <AlertDescription>
                                Las siguientes acciones eliminarán permanentemente todos los datos del sistema.
                                Asegúrate de tener un respaldo actualizado antes de proceder.
                            </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <RefreshCw className="w-4 h-4 text-orange-600" />
                                    <h3 className="font-semibold text-orange-800">Restaurar Sistema</h3>
                                </div>
                                <p className="text-sm text-orange-700 mb-4">
                                    Restaura el sistema a su configuración de fábrica eliminando todos los datos personalizados.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                                    disabled
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Restaurar a Fábrica
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal: Agregar Usuario */}
            <Dialog open={openAddUserModal} onOpenChange={setOpenAddUserModal}>
                <DialogContent className="sm:max-w-md border-2 border-emerald-100">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <UserPlus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-emerald-800">Agregar Nuevo Usuario</DialogTitle>
                                <DialogDescription>
                                    Complete todos los campos para crear un nuevo usuario del sistema
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {userSuccess && (
                        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                                ¡Usuario creado exitosamente! El nuevo usuario puede iniciar sesión ahora.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-700">
                                <UserPlus className="w-3 h-3 inline mr-1" />
                                Nombre de usuario
                            </Label>
                            <Input
                                id="username"
                                placeholder="ej: enfermero01"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                                <Key className="w-3 h-3 inline mr-1" />
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="pr-10 focus:border-emerald-400 focus:ring-emerald-400"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="question" className="text-gray-700">
                                <Shield className="w-3 h-3 inline mr-1" />
                                Pregunta de seguridad
                            </Label>
                            <Select
                                value={newUser.question}
                                onValueChange={(value) => setNewUser({ ...newUser, question: value })}
                            >
                                <SelectTrigger className="focus:border-emerald-400 focus:ring-emerald-400">
                                    <SelectValue placeholder="Selecciona una pregunta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECURITY_QUESTIONS.map((question, index) => (
                                        <SelectItem key={index} value={question}>
                                            {question}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="answer" className="text-gray-700">
                                Respuesta de seguridad
                            </Label>
                            <Input
                                id="answer"
                                placeholder="Tu respuesta secreta"
                                value={newUser.answer}
                                onChange={(e) => setNewUser({ ...newUser, answer: e.target.value })}
                                className="focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setOpenAddUserModal(false)}
                            className="border-gray-300"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddUser}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                            disabled={!newUser.username || !newUser.password || !newUser.question || !newUser.answer}
                        >
                            {userSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    ¡Creado!
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Crear Usuario
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Confirmar Eliminación de Base de Datos */}
            <Dialog open={confirmDeleteDB} onOpenChange={setConfirmDeleteDB}>
                <DialogContent className="sm:max-w-md border-2 border-red-100">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-red-800">Confirmar Eliminación Total</DialogTitle>
                                <DialogDescription className="text-red-600">
                                    Esta acción es irreversible. Todos los datos se perderán permanentemente.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <Alert variant="destructive" className="my-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>¡Atención Crítica!</AlertTitle>
                        <AlertDescription>
                            Se eliminarán: 156 pacientes, 1,245 historiales médicos, 12 usuarios y toda la configuración.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <p className="text-gray-700 text-sm">
                            Para confirmar esta acción destructiva, por favor escribe <span className="font-bold text-red-700">"ELIMINAR"</span> en el campo de abajo:
                        </p>

                        <Input
                            placeholder="Escribe 'ELIMINAR' aquí"
                            value={confirmDeleteText}
                            onChange={(e) => setConfirmDeleteText(e.target.value)}
                            className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        />

                        {confirmDeleteText && confirmDeleteText !== "ELIMINAR" && (
                            <p className="text-red-600 text-sm flex items-center gap-1">
                                <X className="w-4 h-4" />
                                El texto no coincide. Por favor escribe exactamente "ELIMINAR"
                            </p>
                        )}

                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <p className="text-sm text-amber-700">
                                <span className="font-semibold">Recomendación:</span> Crea un respaldo de la base de datos antes de proceder.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmDeleteDB(false);
                                setConfirmDeleteText("");
                            }}
                            className="border-gray-300"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteDatabase}
                            disabled={confirmDeleteText !== "ELIMINAR" || isDeletingDB}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        >
                            {isDeletingDB ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar Permanentemente
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}