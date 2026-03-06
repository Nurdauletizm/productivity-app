"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NewTaskModal } from "@/components/NewTaskModal";
import { AIGenerateModal } from "@/components/AIGenerateModal";
import { Sparkles } from "lucide-react";
import { mutate } from "swr";

export default function BoardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIGenerateModalOpen, setIsAIGenerateModalOpen] = useState(false);

    // We will pass this trigger down to KanbanBoard
    const [newTaskTrigger, setNewTaskTrigger] = useState<{
        title: string;
        description: string;
        deadline: string;
        status: "BACKLOG" | "IN_PROGRESS" | "DONE";
        goalId: string;
        labels: string[];
        id: string;
    } | null>(null);

    const handleCreateTask = (title: string, description: string, deadline: string, status: "BACKLOG" | "IN_PROGRESS" | "DONE", goalId: string, labels: string[]) => {
        setNewTaskTrigger({
            title,
            description,
            deadline,
            status,
            goalId,
            labels,
            id: `task-${Date.now()}` // Generate unique ID
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#0a0a0a] relative transition-colors">
            <header className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-10 transition-colors">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Project Tasks</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage and track your goals from start to finish.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        New Task
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                <KanbanBoard newTask={newTaskTrigger} />
            </main>

            {isModalOpen && (
                <NewTaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateTask}
                />
            )}

            {/* AI Generate FAB */}
            <button
                onClick={() => setIsAIGenerateModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-20 group"
                title="Generate Plan with AI"
            >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold mt-0.5 tracking-wider">AI</span>
            </button>

            <AIGenerateModal
                isOpen={isAIGenerateModalOpen}
                onClose={() => setIsAIGenerateModalOpen(false)}
                onSuccess={() => mutate("/api/tasks")}
            />
        </div>
    );
}
