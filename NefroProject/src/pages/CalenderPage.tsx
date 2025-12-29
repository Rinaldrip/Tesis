import NephrologyCalendar from "@/components/custom/calendario/Calender"

function CalendarPage() {
    return (
        <div className="w-full h-screen bg-gray-50 flex flex-col">

            {/* Contenedor principal con padding */}
            <div className="flex-1 p-4 flex flex-col h-full">

                <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
                    Calendario de Actividades del Servicio de Nefrología
                </h1>
                <p className="text-gray-600 mb-10 text-center">
                    Visualiza y gestiona los proximos eventos y actividades relacionadas con el servicio de nefrología en nuestro calendario interactivo.
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex-1 border border-gray-200">

                    <NephrologyCalendar />

                </div>
            </div>
        </div>
    )
}

export default CalendarPage;