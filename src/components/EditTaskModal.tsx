import { useState, useEffect } from "react";
import { Task, TaskStatus } from "./TaskCard";
import { X } from "lucide-react";

interface Goal {
    id: string;
    title: string;
}

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSubmit: (taskId: string, data: Partial<Task>) => void;
    onDelete?: (taskId: string) => void;
}

export function EditTaskModal({ isOpen, onClose, task, onSubmit, onDelete }: EditTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [status, setStatus] = useState<TaskStatus>("BACKLOG");
    const [labels, setLabels] = useState("");
    const [goalId, setGoalId] = useState("");
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setDeadline(task.deadline ? task.deadline.split("T")[0] : "");
            setStatus(task.status);
            setLabels(Array.isArray(task.labels) ? task.labels.join(", ") : "");
            setGoalId(task.goalId || "");
        }
    }, [task]);

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
        }
    }, [isOpen]);

    if (!isOpen || !task) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(task.id, {
            title,
            description,
            deadline: deadline || undefined,
            status,
            labels: labels.split(",").map((l) => l.trim()).filter(Boolean),
            goalId: goalId || undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-black dark:text-zinc-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="e.g. Design landing page"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all min-h-[100px] resize-y placeholder-gray-400 dark:placeholder-zinc-600"
                            placeholder="Add more details about this task..."
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
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
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
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
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
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all"
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
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-zinc-600"
                                placeholder="comma, separated"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(task.id);
                                    onClose();
                                }}
                                className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border border-transparent dark:border-zinc-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
