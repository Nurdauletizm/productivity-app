"use client";

import { Goal, GoalCard } from "@/components/GoalCard";
import { NewGoalModal } from "@/components/NewGoalModal";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

import { EditGoalModal } from "@/components/EditGoalModal";

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/goals");
            if (!res.ok) throw new Error("Failed to fetch goals");
            const data = await res.json();
            setGoals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGoal = async (title: string, description: string, deadline: string) => {
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, deadline }),
            });
            if (!res.ok) throw new Error("Failed to create goal");

            fetchGoals();
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

            fetchGoals();
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

            fetchGoals();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Goals</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your macro objectives and their progress.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center text-gray-400 mt-10">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center mt-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No goals yet</h3>
                        <p className="text-gray-500 mt-1">Create your first goal to start tracking progress.</p>
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
