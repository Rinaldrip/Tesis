import NephrologyCalendar from "@/components/custom/calendario/Calender"

function CalendarPage() {
    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col">

            {/* Contenedor flexible que ocupa todo el espacio disponible */}
            <div className="flex-1 p-4">

                {/* Contenedor del calendario que ocupa toda la altura disponible */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-full">

                    {/* NephrologyCalendar se adaptará al 100% de altura de este contenedor */}
                    <NephrologyCalendar />

                </div>
            </div>
        </div>
    )
}

export default CalendarPage;