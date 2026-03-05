"use client";

import { useEffect, useState } from "react";
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

    const [goal, setGoal] = useState<Goal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [newTaskTrigger, setNewTaskTrigger] = useState<{
        id: string; // Temporarily generated ID for KanbanBoard prop type
        title: string;
        description: string;
        deadline: string;
        status: "BACKLOG" | "IN_PROGRESS" | "DONE";
        goalId: string;
        labels: string[];
    } | null>(null);

    useEffect(() => {
        const fetchGoalDetails = async () => {
            try {
                const res = await fetch(`/api/goals/${goalId}`);
                if (!res.ok) {
                    throw new Error("Goal not found");
                }
                const data = await res.json();
                setGoal(data);
            } catch (error) {
                console.error("Error fetching goal:", error);
                router.push("/goals");
            } finally {
                setIsLoading(false);
            }
        };

        if (goalId) {
            fetchGoalDetails();
        }
    }, [goalId, router]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <p className="text-gray-400">Loading goal details...</p>
            </div>
        );
    }

    if (!goal) return null;

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
        <div className="flex flex-col h-full bg-[#fbfbfa]">
            <header className="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <button
                    onClick={() => router.push("/goals")}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{goal.title}</h1>
                    </div>
                    {goal.description && (
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{goal.description}</p>
                    )}
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
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
