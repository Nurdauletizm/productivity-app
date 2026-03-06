"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { NewTaskModal } from "@/components/NewTaskModal";
import { ArrowLeft, Plus, Target } from "lucide-react";

interface Goal {
    id: string;
    title: string;
    description?: string;
}

export default function GoalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const goalId = params.id as string;

    const { data: goal, isLoading, error } = useSWR<Goal>(
        goalId ? `/api/goals/${goalId}` : null,
        fetcher,
        {
            onError: (err) => {
                console.error("Error fetching goal:", err);
                router.push("/goals");
            }
        }
    );

    // State for task modal
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [newTaskTrigger, setNewTaskTrigger] = useState<{
        id: string;
        title: string;
        description: string;
        deadline: string;
        status: "BACKLOG" | "IN_PROGRESS" | "DONE";
        goalId: string;
        labels: string[];
    } | null>(null);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-zinc-900 transition-colors">
                <p className="text-gray-400 dark:text-zinc-500">Loading goal details...</p>
            </div>
        );
    }

    if (!goal || error) return null;

    const handleCreateTask = (title: string, description: string, deadline: string, status: any, goalId: string, labels: string[]) => {
        setNewTaskTrigger({
            id: Date.now().toString(), // temporary id for prop
            title,
            description,
            deadline,
            status,
            goalId,
            labels: labels.length > 0 ? labels : ["new"],
        });
        setIsNewTaskModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#0a0a0a] transition-colors">
            <header className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-4 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm sticky top-0 z-10 shrink-0 transition-colors">
                <button
                    onClick={() => router.push("/goals")}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">{goal.title}</h1>
                    </div>
                    {goal.description && (
                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 max-w-2xl">{goal.description}</p>
                    )}
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="flex items-center gap-2 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                {/* 
                  The KanbanBoard expects to take up full height/width of its container.
                  We provide the custom goalId to filter the tasks to just this goal natively. 
                */}
                <KanbanBoard goalId={goalId} newTask={newTaskTrigger} />
            </main>

            <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                onSubmit={handleCreateTask}
                prefilledGoalId={goalId}
            />
        </div>
    );
}
