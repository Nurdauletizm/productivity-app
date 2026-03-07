"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Flame, Trash2, CheckCircle2, Circle } from "lucide-react";
import { NewHabitModal } from "@/components/NewHabitModal";

interface HabitLog {
    id: string;
    habitId: string;
    date: string;
}

interface Habit {
    id: string;
    name: string;
    emoji: string;
    color: string;
    logs: HabitLog[];
}

function getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    return days;
}

function calcStreak(logs: HabitLog[]): number {
    const logDates = new Set(logs.map((l) => l.date));
    let streak = 0;
    const d = new Date();
    while (true) {
        const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (logDates.has(str)) {
            streak++;
            d.setDate(d.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function HabitCard({ habit, onToggle, onDelete }: { habit: Habit; onToggle: (id: string, date: string, done: boolean) => void; onDelete: (id: string) => void }) {
    const today = getTodayStr();
    const last7 = getLast7Days();
    const logDates = new Set(habit.logs.map((l) => l.date));
    const doneToday = logDates.has(today);
    const streak = calcStreak(habit.logs);

    const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: habit.color + "22", border: `2px solid ${habit.color}33` }}
                    >
                        {habit.emoji}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-zinc-100 text-base">{habit.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-xs text-orange-500 font-medium">{streak} дней подряд</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(habit.id)}
                    className="text-gray-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Last 7 days mini heatmap */}
            <div className="flex gap-1.5 items-center">
                {last7.map((date, i) => {
                    const done = logDates.has(date);
                    const isToday = date === today;
                    return (
                        <div key={date} className="flex flex-col items-center gap-1 flex-1">
                            <div
                                className={`w-full aspect-square rounded-lg transition-all ${done ? "opacity-100" : "opacity-20"} ${isToday ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-zinc-500" : ""}`}
                                style={{ backgroundColor: done ? habit.color : "#d1d5db" }}
                            />
                            <span className="text-[9px] text-gray-400 dark:text-zinc-600">{dayLabels[(new Date(date).getDay() + 6) % 7]}</span>
                        </div>
                    );
                })}
            </div>

            {/* Toggle today button */}
            <button
                onClick={() => onToggle(habit.id, today, doneToday)}
                className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${doneToday
                        ? "text-white"
                        : "border-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                style={doneToday ? { backgroundColor: habit.color } : { borderColor: habit.color + "66" }}
            >
                {doneToday ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        Выполнено сегодня!
                    </>
                ) : (
                    <>
                        <Circle className="w-4 h-4" />
                        Отметить сегодня
                    </>
                )}
            </button>
        </div>
    );
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchHabits = useCallback(async () => {
        const res = await fetch("/api/habits");
        if (res.ok) {
            setHabits(await res.json());
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleToggle = async (habitId: string, date: string, isDone: boolean) => {
        // Optimistic update
        setHabits((prev) =>
            prev.map((h) => {
                if (h.id !== habitId) return h;
                if (isDone) {
                    return { ...h, logs: h.logs.filter((l) => l.date !== date) };
                } else {
                    return { ...h, logs: [...h.logs, { id: "tmp", habitId, date }] };
                }
            })
        );

        const method = isDone ? "DELETE" : "POST";
        await fetch(`/api/habits/${habitId}/log`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date }),
        });
        fetchHabits(); // re-sync
    };

    const handleDelete = async (habitId: string) => {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
        await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    };

    const handleCreated = (habit: Habit) => {
        setHabits((prev) => [...prev, habit]);
    };

    const doneTodayCount = habits.filter((h) => h.logs.some((l) => l.date === getTodayStr())).length;

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Привычки</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                        Отслеживай ежедневные привычки и строй стрики 🔥
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Новая привычка
                </button>
            </div>

            {/* Stats bar */}
            {habits.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">
                            {doneTodayCount === habits.length && habits.length > 0 ? "🎉" : "⚡"}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-zinc-100">
                                Сегодня выполнено{" "}
                                <span className="text-indigo-600 dark:text-indigo-400">
                                    {doneTodayCount} из {habits.length}
                                </span>
                            </p>
                            <div className="mt-1.5 w-full max-w-xs bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                    style={{ width: habits.length > 0 ? `${(doneTodayCount / habits.length) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Habit Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400">Загружаю...</div>
            ) : habits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-6xl mb-4">🌱</div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-zinc-300 mb-1">Привычек пока нет</h3>
                    <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6 max-w-xs">
                        Создай первую привычку и начни строить лучшую версию себя — один день за раз.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Создать первую привычку
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {habits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <NewHabitModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
            )}
        </div>
    );
}
