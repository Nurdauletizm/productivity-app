"use client";

import { Goal, GoalCard } from "@/components/GoalCard";
import { NewGoalModal } from "@/components/NewGoalModal";
import { Plus } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

import { EditGoalModal } from "@/components/EditGoalModal";

export default function GoalsPage() {
    const { data: goals, isLoading, mutate } = useSWR<Goal[]>("/api/goals", fetcher);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleCreateGoal = async (title: string, description: string, deadline: string) => {
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, deadline }),
            });
            if (!res.ok) throw new Error("Failed to create goal");

            mutate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditGoal = async (goalId: string, title: string, description: string, deadline: string) => {
        try {
            const res = await fetch(`/api/goals/${goalId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, deadline }),
            });
            if (!res.ok) throw new Error("Failed to update goal");

            mutate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        try {
            const res = await fetch(`/api/goals/${goalId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete goal");

            mutate();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#0a0a0a] relative transition-colors">
            <header className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-10 transition-colors">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Goals</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Track your macro objectives and their progress.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                {isLoading || !goals ? (
                    <div className="flex justify-center text-gray-400 dark:text-zinc-500 mt-10 transition-colors">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center mt-20">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 transition-colors">
                            <Plus className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">No goals yet</h3>
                        <p className="text-gray-500 dark:text-zinc-400 mt-1">Create your first goal to start tracking progress.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={setEditingGoal}
                                onDelete={handleDeleteGoal}
                            />
                        ))}
                    </div>
                )}
            </main>

            <NewGoalModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateGoal}
            />

            <EditGoalModal
                isOpen={!!editingGoal}
                onClose={() => setEditingGoal(null)}
                goal={editingGoal}
                onSubmit={handleEditGoal}
            />
        </div>
    );
}
