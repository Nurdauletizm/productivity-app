import { CalendarGrid } from "@/components/CalendarGrid";
import { Plus } from "lucide-react";

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full bg-white">
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 w-full">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Calendar</h1>
                    <p className="text-sm text-gray-500 mt-1">Plan your time and view upcoming task deadlines.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Event
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto w-full">
                <div className="h-full bg-white rounded-2xl">
                    <CalendarGrid />
                </div>
            </main>
        </div>
    );
}
