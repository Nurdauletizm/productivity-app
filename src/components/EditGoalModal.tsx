"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Goal } from "./GoalCard";

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
    onSubmit: (goalId: string, title: string, description: string, deadline: string) => void;
}

export function EditGoalModal({ isOpen, onClose, goal, onSubmit }: EditGoalModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");

    useEffect(() => {
        if (goal) {
            setTitle(goal.title);
            setDescription(goal.description || "");
            setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
        }
    }, [goal]);

    if (!isOpen || !goal) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit(goal.id, title, description, deadline);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 text-left">
            <div
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Edit Goal</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black dark:text-zinc-200">
                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Goal Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="e.g. Build Productivity App"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Description
                        </label>
                        <textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all min-h-[100px] resize-y placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="Add details about this goal..."
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Target Deadline
                        </label>
                        <input
                            id="edit-deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
                        />
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
