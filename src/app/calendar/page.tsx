import { CalendarGrid } from "@/components/CalendarGrid";
import { Plus } from "lucide-react";

export default function CalendarPage() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#121212] transition-colors">
            <header className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-10 w-full transition-colors">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Calendar</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Plan your time and view upcoming task deadlines.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-100 text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Event
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto w-full bg-[#fbfbfa] dark:bg-[#0a0a0a] transition-colors">
                <div className="h-full bg-white dark:bg-[#121212] rounded-2xl transition-colors">
                    <CalendarGrid />
                </div>
            </main>
        </div>
    );
}
