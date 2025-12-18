import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';

const SpecialistPanel: React.FC = () => {
  const specialist = {
    name: 'Dr. Gilberto Rinaldi',
    title: 'Especialista Nefrologo',
    phone: '+58 412-345-6789',
    email: 'jgrinadli@gmail.com',
    shiftStart: '08:00 AM',
    shiftEnd: '06:00 PM',
  };

  const upcomingSchedule = [
    { time: '2:00 PM', patient: 'Seguimiento - Maria Rodriguez', type: 'Rutina' },
    { time: '2:30 PM', patient: 'Consulta - Paciente nuevo', type: 'Nuevo' },
    { time: '3:15 PM', patient: 'Revisión de laboratorio - José Pérez', type: 'Critico' },
    { time: '4:00 PM', patient: 'Reunión para la creación de plan de diálisis', type: 'Reunión' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Critico':
        return 'text-red-600 bg-red-100';
      case 'Nuevo':
        return 'text-blue-600 bg-blue-100';
      case 'Reunión':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Especialista activo</h2>
      </div>

      {/* Specialist Info */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">GR</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{specialist.name}</h3>
            <p className="text-blue-900 font-medium">{specialist.title}</p>
            <div className="flex items-center space-x-2">
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{specialist.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{specialist.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{specialist.shiftStart} - {specialist.shiftEnd}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Cronograma de Actividades</h4>
        <div className="space-y-3">
          {upcomingSchedule.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="text-sm font-medium text-gray-600 w-16">{item.time}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.patient}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialistPanel;