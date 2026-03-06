import { Droppable } from "@hello-pangea/dnd";
import { Task, TaskCard } from "./TaskCard";

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
    return (
        <div className="flex flex-col flex-1 min-w-[320px] max-w-sm bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-4 shrink-0 transition-colors">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-gray-700 dark:text-zinc-300">{title}</h3>
                <span className="bg-white dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                    {tasks.length}
                </span>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 transition-colors rounded-xl min-h-[150px] ${snapshot.isDraggingOver ? "bg-gray-100 dark:bg-zinc-800/80" : ""
                            }`}
                    >
                        {tasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index} onClick={onTaskClick} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
