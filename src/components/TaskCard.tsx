"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Tag, Sparkles, CheckSquare, Square, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { mutate } from "swr";

export type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "DONE";

export interface ChecklistItem {
    text: string;
    done: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    labels?: string[];
    deadline?: string;
    goalId?: string;
    goalTitle?: string;
    checklist?: string | ChecklistItem[] | null;
}

interface TaskCardProps {
    task: Task;
    index: number;
    onClick?: (task: Task) => void;
}

function parseChecklist(raw: Task['checklist']): ChecklistItem[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw as string); } catch { return []; }
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(parseChecklist(task.checklist));
    const [showChecklist, setShowChecklist] = useState(checklist.length > 0);

    const generateSubtasks = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsGenerating(true);
        setShowChecklist(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}/subtasks`, { method: "POST" });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setChecklist(data.checklist);
            mutate("/api/tasks");
        } catch {
            // silently fail
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleItem = async (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        const updated = checklist.map((item, i) =>
            i === idx ? { ...item, done: !item.done } : item
        );
        setChecklist(updated);
        await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checklist: updated })
        });
    };

    const doneCount = checklist.filter(i => i.done).length;
    const progress = checklist.length > 0 ? Math.round((doneCount / checklist.length) * 100) : 0;

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick && onClick(task)}
                    className={`bg-white dark:bg-zinc-800 p-4 rounded-xl border mb-3 transition-all ${snapshot.isDragging
                        ? "shadow-lg border-blue-300 dark:border-blue-500/50"
                        : "border-gray-100 dark:border-zinc-700 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-500 cursor-pointer"
                        }`}
                >
                    {/* Labels / Tags */}
                    {Array.isArray(task.labels) && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {task.labels.map((label, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title row with ✨ button */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-zinc-100 flex-1">{task.title}</h4>
                        <button
                            onClick={generateSubtasks}
                            title="Сгенерировать подзадачи с помощью AI"
                            disabled={isGenerating}
                            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors disabled:opacity-50"
                        >
                            {isGenerating
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Sparkles className="w-3.5 h-3.5" />
                            }
                        </button>
                    </div>

                    {/* Description */}
                    {task.description && !checklist.length && (
                        <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-3">
                            {task.description}
                        </p>
                    )}

                    {/* Checklist */}
                    {checklist.length > 0 && (
                        <div className="mt-2 mb-3">
                            {/* Progress bar + toggle */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowChecklist(s => !s); }}
                                className="w-full flex items-center gap-2 mb-1.5 group"
                            >
                                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
                                    {doneCount}/{checklist.length}
                                </span>
                                {showChecklist
                                    ? <ChevronUp className="w-3 h-3 text-gray-400" />
                                    : <ChevronDown className="w-3 h-3 text-gray-400" />
                                }
                            </button>

                            {showChecklist && (
                                <ul className="space-y-1">
                                    {checklist.map((item, idx) => (
                                        <li
                                            key={idx}
                                            onClick={(e) => toggleItem(e, idx)}
                                            className="flex items-start gap-1.5 cursor-pointer group/item"
                                        >
                                            {item.done
                                                ? <CheckSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                : <Square className="w-3.5 h-3.5 text-gray-300 dark:text-zinc-600 shrink-0 mt-0.5 group-hover/item:text-gray-400" />
                                            }
                                            <span className={`text-xs leading-relaxed ${item.done
                                                ? 'line-through text-gray-400 dark:text-zinc-500'
                                                : 'text-gray-600 dark:text-zinc-300'
                                                }`}>
                                                {item.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Footer Metadata */}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        {task.deadline ? (
                            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md transition-colors">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div />
                        )}

                        {task.goalTitle && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 truncate max-w-[120px] transition-colors">
                                <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{task.goalTitle}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
}
