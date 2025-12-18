import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  UserCheck,
  LogOut,
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', path: '/home', label: 'Inicio', icon: Home, exact: true },
    { id: 'patients', path: '/pacientes', label: 'Pacientes', icon: Users, exact: false },
    { id: 'appointments', path: '/calendario', label: 'Calendario', icon: Calendar, exact: true },
    { id: 'reports', path: '/reportes', label: 'Reportes', icon: FileText, exact: true },
    { id: 'staff', path: '/personal', label: 'Personal', icon: UserCheck, exact: true },
    { id: 'settings', path: '/configuracion', label: 'Configuración', icon: Settings, exact: true },
  ];

  const isItemActive = (itemPath: string, exact: boolean = true) => {
    if (exact) {
      return location.pathname === itemPath;
    } else {
      return location.pathname.startsWith(itemPath);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col shadow-sm">
      {/* Encabezado institucional */}
      <div className="p-5 border-b border-gray-300 bg-gray-50">
        <div className="flex items-center space-x-3">
          <img className="w-16 h-16 rounded-full border border-gray-300" src={logo} alt="Logo" />

          <div className="leading-tight">
            <h1 className="text-[20px] font-bold text-blue-950 uppercase tracking-wide">
              Servicio de Nefrología
            </h1>
            <div className="w-14 border-t-2 border-yellow-600 my-1"></div>
            <p className="text-[12px] text-gray-600 leading-snug">
              Hospital Universitario<br />“Manuel Núñez Tovar”
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.path, item.exact);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-blue-950 text-white border-l-4 border-yellow-500'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-800'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="relative p-3 text-gray-600 hover:text-red-600 transition-colors cursor-pointer group"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm mx-4 overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">¿Cerrar sesión?</h3>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Se cerrará tu sesión actual y deberás volver a iniciar sesión.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sí, salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Sidebar;

