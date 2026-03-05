import { Target, Calendar as CalendarIcon, CheckCircle2, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { isPast, parseISO, startOfDay } from "date-fns";

export interface Goal {
    id: string;
    title: string;
    description?: string;
    deadline?: string;
    tasksTotal: number;
    tasksCompleted: number;
}

interface GoalCardProps {
    goal: Goal;
    onEdit?: (goal: Goal) => void;
    onDelete?: (goalId: string) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const progressPercent = goal.tasksTotal > 0
        ? Math.round((goal.tasksCompleted / goal.tasksTotal) * 100)
        : 0;

    const isCompleted = progressPercent === 100 && goal.tasksTotal > 0;
    const isOverdue = !isCompleted && goal.deadline && isPast(startOfDay(parseISO(goal.deadline)));

    // Dynamic styling
    let cardStyle = "border-gray-100 bg-white";
    let iconStyle = "bg-blue-50 text-blue-600";
    let progressBarStyle = "bg-black";

    if (isCompleted) {
        cardStyle = "border-green-200 bg-green-50/30";
        iconStyle = "bg-green-100 text-green-700";
        progressBarStyle = "bg-green-500";
    } else if (isOverdue) {
        cardStyle = "border-red-200 bg-red-50/30";
        iconStyle = "bg-red-100 text-red-700";
        progressBarStyle = "bg-red-500";
    }

    return (
        <div className={`border rounded-2xl p-6 hover:shadow-md transition-shadow group flex flex-col h-full relative ${cardStyle}`}>
            <div className="flex justify-between items-start mb-4">
                <Link href={`/goals/${goal.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyle}`}>
                        <Target className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 pr-6">{goal.title}</h3>
                </Link>

                {/* Actions Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-100">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(false);
                                    onEdit?.(goal);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Goal
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsMenuOpen(false);
                                    if (window.confirm("Are you sure you want to delete this goal? Tasks connected to it will not be deleted, but will be unlabeled.")) {
                                        onDelete?.(goal.id);
                                    }
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {goal.description && (
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                    {goal.description}
                </p>
            )}

            {/* Progress Bar Section */}
            <div className="mt-auto pt-4 border-t border-gray-50">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{goal.tasksCompleted} / {goal.tasksTotal} tasks</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{progressPercent}%</span>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${progressBarStyle}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {goal.deadline && (
                    <div className={`flex items-center gap-1 mt-4 text-xs font-medium ${isOverdue && !isCompleted ? 'text-red-500' : 'text-gray-400'}`}>
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
