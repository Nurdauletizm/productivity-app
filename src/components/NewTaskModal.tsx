"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Goal {
    id: string;
    title: string;
}

type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "DONE";

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string, deadline: string, status: TaskStatus, goalId: string, labels: string[]) => void;
    prefilledDate?: string;
    prefilledGoalId?: string;
}

export function NewTaskModal({ isOpen, onClose, onSubmit, prefilledDate, prefilledGoalId }: NewTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState(prefilledDate || "");
    const [status, setStatus] = useState<TaskStatus>("BACKLOG");
    const [labels, setLabels] = useState("");
    const [goalId, setGoalId] = useState(prefilledGoalId || "");
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        if (isOpen) {
            const fetchGoals = async () => {
                try {
                    const res = await fetch("/api/goals");
                    if (res.ok) {
                        const data = await res.json();
                        setGoals(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch goals", error);
                }
            };
            fetchGoals();

            // Reset fields
            setTitle("");
            setDescription("");
            setDeadline(prefilledDate || "");
            setStatus("BACKLOG");
            setLabels("new");
            setGoalId(prefilledGoalId || "");
        }
    }, [isOpen, prefilledDate, prefilledGoalId]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit(
            title,
            description,
            deadline,
            status,
            goalId,
            labels.split(",").map((l) => l.trim()).filter(Boolean)
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 text-left">
            <div
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black dark:text-zinc-200">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="e.g. Design Landing Page"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all min-h-[100px] resize-y placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="Add details about this task..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                            >
                                <option value="BACKLOG">Backlog</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Deadline
                            </label>
                            <input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Goal
                            </label>
                            <select
                                value={goalId}
                                onChange={(e) => setGoalId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                            >
                                <option value="">No Goal</option>
                                {goals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                                Labels
                            </label>
                            <input
                                type="text"
                                value={labels}
                                onChange={(e) => setLabels(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                                placeholder="comma, separated"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-50 dark:border-zinc-800/50 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent dark:border-zinc-700"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
