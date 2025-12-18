import NephrologyCalendar from "@/components/custom/calendario/Calender"

function CalendarPage() {
    return (
        <div className="w-full h-full p-2">
            <div className="mb-6">
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <NephrologyCalendar />
            </div>
        </div>
    )
}

export default CalendarPage;