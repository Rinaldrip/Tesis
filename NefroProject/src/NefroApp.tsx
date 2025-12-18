import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Search, Bell } from "lucide-react"
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

// Componente helper para lazy loading
const LazyRoute = ({ importFunc }: { importFunc: () => Promise<any> }) => {
  const LazyComponent = lazy(importFunc);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent />
    </Suspense>
  );
};

// Lazy imports
const StatsPage = () => <LazyRoute importFunc={() => import('./pages/Pattient/StatsPage')} />;
const AppointmentsPage = () => <LazyRoute importFunc={() => import("./pages/CalenderPage")} />;
const ReportsPage = () => <LazyRoute importFunc={() => import("./pages/ReportsPage")} />;
const StaffPage = () => <LazyRoute importFunc={() => import("./pages/StaffPage")} />;
const SettingsPage = () => <LazyRoute importFunc={() => import("./pages/SettingsPage")} />;
const InfoPattientPage = () => <LazyRoute importFunc={() => import('./pages/Pattient/InfoPattientPage')} />;
const AddPatientPage = () => <LazyRoute importFunc={() => import('./pages/Pattient/AddPatientPage')} />;
const EvolutionPage = () => <LazyRoute importFunc={() => import('./pages/Pattient/EvolutionPage')} />;

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
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                />
              </div>

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
        <Route path="/" element={
          <Navigate to="/login" replace />
        } />

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
            <AddPatientPage />
          </ProtectedRoute>
        } />

        <Route path="/pacientes/edit/:id" element={
          <ProtectedRoute>
            <div>Formulario de editar paciente</div>
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula" element={
          <ProtectedRoute>
            <InfoPattientPage />
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula/evo" element={
          <ProtectedRoute>
            <EvolutionPage />
          </ProtectedRoute>
        } />

        <Route path="/pacientes/:cedula/stats" element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        } />

        <Route path="/calendario" element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        } />

        <Route path="/reportes" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />

        <Route path="/personal" element={
          <ProtectedRoute>
            <StaffPage />
          </ProtectedRoute>
        } />

        <Route path="/configuracion" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Ruta para manejar 404 - redirige según autenticación */}
        <Route path="*" element={
          <Navigate to="/home" replace />
        } />
      </Routes>
    </Router>
  );
}

export default NefroApp;