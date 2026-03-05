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
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="e.g. Design landing page"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-h-[100px] resize-y"
                            placeholder="Add more details about this task..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all bg-white"
                            >
                                <option value="BACKLOG">Backlog</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deadline
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Goal
                            </label>
                            <select
                                value={goalId}
                                onChange={(e) => setGoalId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all bg-white"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Labels
                            </label>
                            <input
                                type="text"
                                value={labels}
                                onChange={(e) => setLabels(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
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
                                className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
