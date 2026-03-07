"use client";
import { useState } from "react";
import { X } from "lucide-react";

const EMOJI_OPTIONS = ["⭐", "💧", "📚", "🏃", "🧘", "💪", "🎯", "🍎", "😴", "✍️", "🎨", "🎵", "🧹", "🌿", "☕", "🚴"];
const COLOR_OPTIONS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6",
];

interface Props {
    onClose: () => void;
    onCreated: (habit: any) => void;
}

export function NewHabitModal({ onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("⭐");
    const [color, setColor] = useState("#6366f1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, emoji, color }),
            });
            if (!res.ok) throw new Error("Failed to create habit");
            const habit = await res.json();
            onCreated(habit);
            onClose();
        } catch {
            setError("Не удалось создать привычку");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Новая привычка</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Emoji picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Иконка</label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJI_OPTIONS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`w-10 h-10 text-xl rounded-xl transition-all ${emoji === e ? "ring-2 ring-offset-1 ring-indigo-500 scale-110" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                            Название
                        </label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-xl px-3">
                            <span className="text-xl">{emoji}</span>
                            <input
                                autoFocus
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Например: Пить воду"
                                className="flex-1 py-3 bg-transparent outline-none text-gray-900 dark:text-zinc-100 placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Color picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Цвет</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    style={{ backgroundColor: c }}
                                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"}`}
                                />
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 py-2.5 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: color }}
                        >
                            {loading ? "Создаю..." : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
