import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bell } from "lucide-react"
import Sidebar from "./components/custom/Sidebar"
import { PatientsPage } from "./pages/Pattient/PatientsPage"
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/login';
import ScrollToTop from './components/custom/ScrollToTop';
import { lazy, Suspense, useEffect, useState } from 'react';
import { HeaderTitle } from './components/custom/HeaderTitle';

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Lazy imports DIRECTOS - sin wrapper LazyRoute
const EditPatientPage = lazy(() => import('./pages/Pattient/EditPage'));
const InfoPattientPage = lazy(() => import('./pages/Pattient/InfoPattientPage'));
const StatsPage = lazy(() => import('./pages/Pattient/StatsPage'));
const AddPatientPage = lazy(() => import('./pages/Pattient/AddPatientPage'));
const EvolutionPage = lazy(() => import('./pages/Pattient/EvolutionPage'));
const AppointmentsPage = lazy(() => import("./pages/CalenderPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const StaffPage = lazy(() => import("./pages/StaffPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Hook para verificar autenticación
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  return { isAuthenticated, checkAuth };
};

// Componente de protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Usar el componente HeaderTitle */}
            <HeaderTitle />

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Componente para rutas públicas (solo para no autenticados)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return <LoadingSpinner />;
  }

  // Si ya está autenticado, redirigir al home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function NefroApp() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Ruta raíz - redirige según autenticación */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta pública de login - solo accesible si NO está autenticado */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Rutas protegidas */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />

        <Route path="/pacientes" element={
          <ProtectedRoute>
            <PatientsPage />
          </ProtectedRoute>
        } />

        <Route path="/pacientes/add" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AddPatientPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula/editar" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EditPatientPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <InfoPattientPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula/evo" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <EvolutionPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula/stats" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <StatsPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/calendario" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AppointmentsPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/reportes" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/personal" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <StaffPage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="/configuracion" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Ruta para manejar 404 - redirige según autenticación */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default NefroApp;