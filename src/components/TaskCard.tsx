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
                    className={`bg-white p-4 rounded-xl border mb-3 transition-all ${snapshot.isDragging ? "shadow-lg border-blue-300" : "border-gray-100 hover:shadow-md hover:border-gray-300 cursor-pointer"
                        }`}
                >
                    {/* Labels / Tags */}
                    {Array.isArray(task.labels) && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {task.labels.map((label, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600"
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>

                    {/* Description */}
                    {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {task.description}
                        </p>
                    )}

                    {/* Footer Metadata */}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                        {task.deadline ? (
                            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div />
                        )}

                        {task.goalTitle && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 text-gray-600 truncate max-w-[120px]">
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
