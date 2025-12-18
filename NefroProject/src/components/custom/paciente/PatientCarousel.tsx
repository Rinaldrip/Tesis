// components/custom/paciente/PatientCarousel.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PacientCart } from './PacientCart';

interface Patient {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  enfermedad: string;
  estado: string | 'Estable' | 'Critico' | 'Mejorando';
  ultimaVisita: string;
  creatina: string;
  proteinasT: string;
}

interface PatientCarouselProps {
  patients?: Patient[];
  patientsPerPage?: number;
  showPagination?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  title?: string;
  description?: string;
}

const PatientCarousel: React.FC<PatientCarouselProps> = ({
  patients = [],
  patientsPerPage = 3,
  showPagination = true,
  autoPlay = true,
  autoPlayInterval = 5000,
  title = "Pacientes Recientes",
  description = "Últimos Pacientes Agregados"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Calcular pacientes visibles
  const totalPages = Math.ceil(patients.length / patientsPerPage);
  const startIndex = currentIndex;
  const endIndex = Math.min(startIndex + patientsPerPage, patients.length);
  const visiblePatients = patients.slice(startIndex, endIndex);

  const displayPatients = [...visiblePatients];
  while (displayPatients.length < patientsPerPage) {
    displayPatients.push({
      id: -displayPatients.length,
      cedula: "",
      nombre: "",
      apellido: "",
      fechaNacimiento: "",
      enfermedad: "",
      estado: "Estable",
      ultimaVisita: "",
      creatina: "",
      proteinasT: ""
    } as Patient);
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex + patientsPerPage >= patients.length) {
        return 0;
      }
      return prevIndex + patientsPerPage;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex - patientsPerPage < 0) {
        return Math.max(0, patients.length - patientsPerPage);
      }
      return prevIndex - patientsPerPage;
    });
  };

  const goToPage = (pageIndex: number) => {
    setCurrentIndex(pageIndex * patientsPerPage);
  };

  // Auto-play del carrusel
  useEffect(() => {
    if (!autoPlay || isPaused || patients.length <= patientsPerPage) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isPaused, patients.length, patientsPerPage]);

  // Pausar auto-play cuando el mouse está sobre el carrusel
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No hay pacientes para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-gray-600">
            {description} • {patients.length} paciente{patients.length !== 1 ? 's' : ''} en total
          </p>
        </div>

        {/* Controles de paginación */}
        {showPagination && patients.length > patientsPerPage && (
          <div className="flex space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex === 0}
              aria-label="Pacientes anteriores"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentIndex + patientsPerPage >= patients.length}
              aria-label="Siguientes pacientes"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Grid de pacientes usando el componente PacientCart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPatients.map((patient, index) => (
          <div key={patient.id > 0 ? patient.id : `placeholder-${index}`} className="h-full">
            {patient.id > 0 ? (
              <PacientCart patient={patient} />
            ) : (
              // Placeholder para espacios vacíos
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 h-full flex items-center justify-center min-h-[200px]">
                <div className="text-center text-gray-400">
                  <div className="text-2xl mb-2">👤</div>
                  <p className="text-sm">No hay paciente</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Indicadores de página y contador */}
      {showPagination && patients.length > patientsPerPage && (
        <div className="flex items-center justify-between mt-6">
          {/* Contador de pacientes visibles */}
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1}-{endIndex} de {patients.length}
          </div>

          {/* Indicadores de página */}
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${Math.floor(currentIndex / patientsPerPage) === index
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientCarousel;