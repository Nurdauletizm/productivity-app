import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Tag } from "lucide-react";

export type TaskStatus = "BACKLOG" | "IN_PROGRESS" | "DONE";

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    labels?: string[];
    deadline?: string;
    goalId?: string;
    goalTitle?: string;
}

interface TaskCardProps {
    task: Task;
    index: number;
    onClick?: (task: Task) => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick && onClick(task)}
                    className={`bg-white dark:bg-zinc-800 p-4 rounded-xl border mb-3 transition-all ${snapshot.isDragging ? "shadow-lg border-blue-300 dark:border-blue-500/50" : "border-gray-100 dark:border-zinc-700 hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-500 cursor-pointer"
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

                    {/* Title */}
                    <h4 className="font-semibold text-gray-900 dark:text-zinc-100 mb-1">{task.title}</h4>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 mb-3">
                            {task.description}
                        </p>
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
