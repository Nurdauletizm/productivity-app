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
        <div className="flex flex-col flex-1 min-w-[320px] max-w-sm bg-gray-50/50 rounded-2xl border border-gray-100 p-4 shrink-0 transition-colors">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-gray-700">{title}</h3>
                <span className="bg-white text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                    {tasks.length}
                </span>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 transition-colors rounded-xl min-h-[150px] ${snapshot.isDraggingOver ? "bg-gray-100" : ""
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
