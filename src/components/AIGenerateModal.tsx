"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, Target } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface Goal {
    id: string;
    title: string;
    description: string | null;
}

interface AIGenerateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultGoalId?: string;
    hideGoalSelection?: boolean;
}

export function AIGenerateModal({ isOpen, onClose, onSuccess, defaultGoalId, hideGoalSelection }: AIGenerateModalProps) {
    const [prompt, setPrompt] = useState("");
    const [selectedGoalId, setSelectedGoalId] = useState<string>(defaultGoalId || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");

    const { data: goals } = useSWR<Goal[]>("/api/goals", fetcher);

    if (!isOpen) return null;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError("");

        try {
            const response = await fetch("/api/ai/generate-tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    goalId: selectedGoalId || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to generate tasks.");
            }

            setPrompt("");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#121212] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">AI Task Generator</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1"
                        disabled={isGenerating}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleGenerate} className="px-6 py-5">
                    {/* Goal Selection (Optional) */}
                    {!hideGoalSelection && (
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-500" />
                                Target Goal (Optional)
                            </label>
                            <select
                                value={selectedGoalId}
                                onChange={(e) => setSelectedGoalId(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-zinc-100 transition-all text-sm disabled:opacity-50 appearance-none"
                                disabled={isGenerating}
                            >
                                <option value="">No specific goal (Board only)</option>
                                {goals?.map(goal => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Prompt Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
                            What do you want to achieve?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. I need a plan to learn Next.js from scratch in 2 weeks..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 font-medium"
                            rows={4}
                            disabled={isGenerating}
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            AI will break this down into actionable tasks with estimated deadlines.
                        </p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            disabled={isGenerating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="px-5 py-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating tasks...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Plan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
