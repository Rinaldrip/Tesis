import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import api from '@/services/paciente.api';
import logo from '../../assets/logo.png'; // Ajusta la ruta según tu estructura

interface FormData {
    username: string;
    password: string;
}

interface FormErrors {
    username?: string;
    password?: string;
}

interface RecoveryData {
    username: string;
    securityQuestion: string;
    securityAnswer: string;
    newPassword: string;
    confirmPassword: string;
}

export default function Login() {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();

    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [showRecoverySuccess, setShowRecoverySuccess] = useState(false);
    const [securityQuestionFromAPI, setSecurityQuestionFromAPI] = useState('');
    const [isLoadingSecurityQuestion, setIsLoadingSecurityQuestion] = useState(false);

    const [recoveryData, setRecoveryData] = useState<RecoveryData>({
        username: '',
        securityQuestion: '',
        securityAnswer: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [recoveryErrors, setRecoveryErrors] = useState<{ [key: string]: string }>({});
    const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false);
    const [recoveryStep, setRecoveryStep] = useState<'verify' | 'reset'>('verify');

    // Verificar si ya está autenticado
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Verificar token con el backend
            verifyToken(token);
        }
    }, []);


    const verifyToken = async (token: string) => {
        try {
            await api.get('/verify-token', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            navigate('/home');
        } catch (error) {
            // Token inválido, limpiar localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRecoveryForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!recoveryData.username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        }

        if (recoveryStep === 'verify') {
            if (!recoveryData.securityAnswer.trim()) {
                newErrors.securityAnswer = 'La respuesta de seguridad es requerida';
            }
        } else {
            if (!recoveryData.newPassword.trim()) {
                newErrors.newPassword = 'La nueva contraseña es requerida';
            } else if (recoveryData.newPassword.length < 8) {
                newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
            }

            if (!recoveryData.confirmPassword.trim()) {
                newErrors.confirmPassword = 'Confirma tu nueva contraseña';
            } else if (recoveryData.newPassword !== recoveryData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setRecoveryErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post('/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));

                // Redirigir al dashboard
                navigate('/home');
            } else {
                setLoginError(response.data.error || 'Error en el inicio de sesión');
            }
        } catch (error: any) {
            console.error('Error de inicio de sesión:', error);
            setLoginError(
                error.response?.data?.error ||
                error.message ||
                'Error de conexión con el servidor'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetSecurityQuestion = async () => {
        if (!recoveryData.username.trim()) {
            setRecoveryErrors({ username: 'El nombre de usuario es requerido' });
            return;
        }

        setIsLoadingSecurityQuestion(true);

        try {
            const response = await api.get(`/security-question/${recoveryData.username}`);

            if (response.data.success) {
                setSecurityQuestionFromAPI(response.data.data.securityQuestion);
                setRecoveryData(prev => ({
                    ...prev,
                    securityQuestion: response.data.data.securityQuestion
                }));
                setRecoveryErrors(prev => ({ ...prev, username: '' }));
            } else {
                setSecurityQuestionFromAPI('');
                setRecoveryErrors({
                    username: response.data.error || 'Usuario no encontrado o sin pregunta de seguridad'
                });
            }
        } catch (error: any) {
            console.error('Error obteniendo pregunta de seguridad:', error);
            setRecoveryErrors({
                username: error.response?.data?.error || 'Error de conexión con el servidor'
            });
        } finally {
            setIsLoadingSecurityQuestion(false);
        }
    };

    const handleVerifySecurityAnswer = async () => {
        if (!validateRecoveryForm()) {
            return;
        }

        setIsRecoverySubmitting(true);

        try {
            // Primero verificamos la respuesta
            const response = await api.post('/forgot-password', {
                username: recoveryData.username,
                securityAnswer: recoveryData.securityAnswer,
                newPassword: 'temporary' // Contraseña temporal, se cambiará después
            });

            if (response.data.success) {
                // Respuesta correcta, avanzar al siguiente paso
                setRecoveryStep('reset');
                setRecoveryErrors({});
            } else {
                setRecoveryErrors({
                    securityAnswer: response.data.error || 'Respuesta incorrecta'
                });
            }
        } catch (error: any) {
            console.error('Error verificando respuesta:', error);
            setRecoveryErrors({
                securityAnswer: error.response?.data?.error || 'Error de conexión con el servidor'
            });
        } finally {
            setIsRecoverySubmitting(false);
        }
    };

    const handleResetPassword = async () => {
        if (!validateRecoveryForm()) {
            return;
        }

        setIsRecoverySubmitting(true);

        try {
            const response = await api.post('/forgot-password', {
                username: recoveryData.username,
                securityAnswer: recoveryData.securityAnswer,
                newPassword: recoveryData.newPassword
            });

            if (response.data.success) {
                // Contraseña restablecida exitosamente
                setShowRecoverySuccess(true);
                setTimeout(() => {
                    resetRecoveryModal();
                }, 3000);
            } else {
                setRecoveryErrors({
                    newPassword: response.data.error || 'Error al restablecer la contraseña'
                });
            }
        } catch (error: any) {
            console.error('Error restableciendo contraseña:', error);
            setRecoveryErrors({
                newPassword: error.response?.data?.error || 'Error de conexión con el servidor'
            });
        } finally {
            setIsRecoverySubmitting(false);
        }
    };

    const handleRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (recoveryStep === 'verify') {
            await handleVerifySecurityAnswer();
        } else {
            await handleResetPassword();
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        if (loginError) setLoginError('');
    };

    const handleRecoveryInputChange = (field: keyof RecoveryData, value: string) => {
        setRecoveryData(prev => ({ ...prev, [field]: value }));
        if (recoveryErrors[field]) {
            setRecoveryErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const resetRecoveryModal = () => {
        setShowRecoveryModal(false);
        setRecoveryStep('verify');
        setRecoveryData({
            username: '',
            securityQuestion: '',
            securityAnswer: '',
            newPassword: '',
            confirmPassword: '',
        });
        setRecoveryErrors({});
        setSecurityQuestionFromAPI('');
        setShowRecoverySuccess(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0A2342] to-[#0d3259] px-8 py-10 text-center">
                        <div className="flex justify-center mb-6">
                            <img
                                src={logo}
                                alt="Hospital Universitario Dr. Manuel Núñez Tovar"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                        <h1 className="text-white text-xl font-semibold leading-tight mb-2">
                            Sistema de Gestión de Pacientes Renales
                        </h1>
                        <p className="text-blue-200 text-sm">
                            Servicio de Nefrología
                        </p>
                        <p className="text-blue-300 text-xs mt-1">
                            Hospital Universitario Dr. Manuel Núñez Tovar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="px-8 py-8">
                        <div className="mb-5">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.username
                                    ? 'border-red-300 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                    }`}
                                placeholder="Ingresa tu nombre de usuario"
                            />
                            {errors.username && (
                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                    <AlertCircle size={14} />
                                    <span>{errors.username}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all pr-12 ${errors.password
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                        }`}
                                    placeholder="Ingresa tu contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                    <AlertCircle size={14} />
                                    <span>{errors.password}</span>
                                </div>
                            )}
                        </div>

                        {loginError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700 text-sm">
                                    <AlertCircle size={16} />
                                    <span>{loginError}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-[#0A2342] to-[#0d3259] text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setShowRecoveryModal(true)}
                                className="text-[#0A2342] hover:text-[#D4AF37] font-medium text-sm transition-colors duration-200"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6 text-gray-600 text-xs">
                    <p>Sistema Seguro del Hospital • Solo para Personal Autorizado</p>
                </div>
            </div>

            {showRecoveryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
                        <div className="bg-gradient-to-r from-[#0A2342] to-[#0d3259] px-8 py-6 flex items-center justify-between">
                            <h2 className="text-white text-lg font-semibold">
                                {recoveryStep === 'verify' ? 'Verificar Identidad' : 'Restablecer Contraseña'}
                            </h2>
                            <button
                                onClick={resetRecoveryModal}
                                className="text-white hover:text-[#D4AF37] transition-colors"
                                disabled={isRecoverySubmitting}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {showRecoverySuccess ? (
                            <div className="px-8 py-12 text-center">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    ¡Contraseña Restablecida!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                                </p>
                                <button
                                    onClick={resetRecoveryModal}
                                    className="bg-gradient-to-r from-[#0A2342] to-[#0d3259] text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleRecoverySubmit} className="px-8 py-8">
                                <p className="text-gray-600 text-sm mb-6">
                                    {recoveryStep === 'verify'
                                        ? 'Por favor ingresa tu nombre de usuario para verificar tu identidad.'
                                        : 'Por favor ingresa tu nueva contraseña.'}
                                </p>

                                {recoveryStep === 'verify' ? (
                                    <>
                                        <div className="mb-5">
                                            <label htmlFor="recovery-username" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre de Usuario
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="recovery-username"
                                                    type="text"
                                                    value={recoveryData.username}
                                                    onChange={(e) => handleRecoveryInputChange('username', e.target.value)}
                                                    className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${recoveryErrors.username
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                                        }`}
                                                    placeholder="Ingresa tu nombre de usuario"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleGetSecurityQuestion}
                                                    disabled={isLoadingSecurityQuestion || !recoveryData.username.trim()}
                                                    className="px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoadingSecurityQuestion ? '...' : 'Buscar'}
                                                </button>
                                            </div>
                                            {recoveryErrors.username && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>{recoveryErrors.username}</span>
                                                </div>
                                            )}
                                        </div>

                                        {securityQuestionFromAPI && (
                                            <>
                                                <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm font-medium text-blue-800 mb-2">
                                                        Pregunta de Seguridad:
                                                    </p>
                                                    <p className="text-blue-700">
                                                        {securityQuestionFromAPI}
                                                    </p>
                                                </div>

                                                <div className="mb-6">
                                                    <label htmlFor="recovery-answer" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Respuesta de Seguridad
                                                    </label>
                                                    <input
                                                        id="recovery-answer"
                                                        type="text"
                                                        value={recoveryData.securityAnswer}
                                                        onChange={(e) => handleRecoveryInputChange('securityAnswer', e.target.value)}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${recoveryErrors.securityAnswer
                                                            ? 'border-red-300 focus:ring-red-200'
                                                            : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                                            }`}
                                                        placeholder="Ingresa tu respuesta"
                                                    />
                                                    {recoveryErrors.securityAnswer && (
                                                        <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                            <AlertCircle size={14} />
                                                            <span>{recoveryErrors.securityAnswer}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-5">
                                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nueva Contraseña
                                            </label>
                                            <input
                                                id="new-password"
                                                type="password"
                                                value={recoveryData.newPassword}
                                                onChange={(e) => handleRecoveryInputChange('newPassword', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${recoveryErrors.newPassword
                                                    ? 'border-red-300 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                                    }`}
                                                placeholder="Ingresa tu nueva contraseña"
                                            />
                                            {recoveryErrors.newPassword && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>{recoveryErrors.newPassword}</span>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                La contraseña debe tener al menos 8 caracteres.
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirmar Nueva Contraseña
                                            </label>
                                            <input
                                                id="confirm-password"
                                                type="password"
                                                value={recoveryData.confirmPassword}
                                                onChange={(e) => handleRecoveryInputChange('confirmPassword', e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${recoveryErrors.confirmPassword
                                                    ? 'border-red-300 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-[#D4AF37] focus:border-[#D4AF37]'
                                                    }`}
                                                placeholder="Confirma tu nueva contraseña"
                                            />
                                            {recoveryErrors.confirmPassword && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>{recoveryErrors.confirmPassword}</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex gap-3">
                                    {recoveryStep === 'reset' && (
                                        <button
                                            type="button"
                                            onClick={() => setRecoveryStep('verify')}
                                            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                                            disabled={isRecoverySubmitting}
                                        >
                                            Volver
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isRecoverySubmitting || (recoveryStep === 'verify' && !securityQuestionFromAPI)}
                                        className={`${recoveryStep === 'reset' ? 'flex-1' : 'w-full'} bg-gradient-to-r from-[#0A2342] to-[#0d3259] text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                    >
                                        {isRecoverySubmitting
                                            ? (recoveryStep === 'verify' ? 'Verificando...' : 'Restableciendo...')
                                            : (recoveryStep === 'verify' ? 'Verificar' : 'Restablecer Contraseña')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}