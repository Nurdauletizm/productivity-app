"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    format,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO,
    isValid
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Tag } from "lucide-react";
import { Task } from "./TaskCard";
import { EditTaskModal } from "./EditTaskModal";
import { NewTaskModal } from "./NewTaskModal";

export function CalendarGrid() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
    const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);

    const { data: rawTasks, isLoading, mutate } = useSWR<Task[]>("/api/tasks", fetcher);

    const tasks = rawTasks ? rawTasks.map((task: any) => ({
        ...task,
        labels: typeof task.labels === 'string' && task.labels.trim() !== ''
            ? task.labels.split(',')
            : task.labels || []
    })) : [];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "MMMM yyyy";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (isLoading || !rawTasks) {
        return <div className="flex h-full items-center justify-center text-gray-400">Loading calendar...</div>;
    }

    const handleEditTask = async (taskId: string, updatedData: Partial<Task>) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) throw new Error("Failed to update task");

            const savedTask: Task = await res.json();

            // Format labels for frontend consistency 
            const rawTask: any = savedTask;
            const formattedTask: Task = {
                ...rawTask,
                labels: typeof rawTask.labels === 'string' && rawTask.labels.trim() !== ''
                    ? rawTask.labels.split(',')
                    : rawTask.labels || []
            }

            mutate();
        } catch (error) {
            console.error("Error updating task in calendar:", error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    {format(currentDate, dateFormat)}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-px mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
                {days.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    // Find tasks for this day
                    const dayTasks = tasks.filter(task => {
                        if (!task.deadline) return false;
                        const taskDate = parseISO(task.deadline);
                        return isValid(taskDate) && isSameDay(taskDate, day);
                    });

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedDay(day)}
                            className={`min-h-[120px] bg-white p-2 transition-colors relative group hover:bg-gray-50 cursor-pointer ${!isCurrentMonth ? "text-gray-400 bg-gray-50/50" : "text-gray-900"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isDayToday ? "bg-black text-white" : ""
                                    }`}>
                                    {format(day, "d")}
                                </span>
                                <button
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-400 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNewTaskDate(day);
                                        setIsNewTaskModalOpen(true);
                                    }}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Tasks for the day */}
                            <div className="space-y-1 mt-2">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTask(task);
                                        }}
                                        className={`text-xs px-2 py-1 rounded truncate font-medium cursor-pointer transition-colors hover:brightness-95 ${task.status === "DONE"
                                            ? "bg-gray-100 text-gray-500 line-through"
                                            : task.status === "IN_PROGRESS"
                                                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                            }`}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Day Modal */}
            {selectedDay && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {format(selectedDay, "EEEE, MMMM d")}
                                </h2>
                                <p className="text-sm text-gray-500">Tasks for this day</p>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {(() => {
                                const dayTasks = tasks.filter(task => {
                                    if (!task.deadline) return false;
                                    const taskDate = parseISO(task.deadline);
                                    return isValid(taskDate) && isSameDay(taskDate, selectedDay);
                                });

                                if (dayTasks.length === 0) {
                                    return (
                                        <div className="text-center py-12 text-gray-500">
                                            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 opacity-50" />
                                            <p className="text-lg font-medium text-gray-900 mb-1">No tasks for this day</p>
                                            <p className="text-sm">Enjoy your free time or add a new task!</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        {dayTasks.map(task => (
                                            <div
                                                key={task.id}
                                                onClick={() => setSelectedTask(task)}
                                                className="group p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h3 className={`font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {task.title}
                                                    </h3>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap ${task.status === "DONE" ? "bg-gray-100 text-gray-500" :
                                                        task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                                                            "bg-orange-100 text-orange-700"
                                                        }`}>
                                                        {task.status.replace("_", " ")}
                                                    </span>
                                                </div>

                                                {task.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 mt-1">
                                                    {Array.isArray(task.labels) && task.labels.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {task.labels.map((label: string, i: number) => (
                                                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                                    #{label}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {task.goalTitle && (
                                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 ml-auto">
                                                            <Tag className="w-3 h-3" />
                                                            {task.goalTitle}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <EditTaskModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onSubmit={handleEditTask}
            />

            {/* Quick Add Task from Calendar */}
            <NewTaskModal
                isOpen={isNewTaskModalOpen}
                onClose={() => setIsNewTaskModalOpen(false)}
                prefilledDate={newTaskDate ? format(newTaskDate, "yyyy-MM-dd") : ""}
                onSubmit={async (title: string, description: string, deadline: string, status: any, goalId: string, labels: string[]) => {
                    try {
                        const res = await fetch("/api/tasks", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                title, description, deadline, status, goalId: goalId || undefined, labels: labels.length > 0 ? labels : ["new"]
                            })
                        });
                        if (res.ok) {
                            mutate();
                        }
                    } catch (e) { console.error(e) }
                }}
            />
        </div>
    );
}
