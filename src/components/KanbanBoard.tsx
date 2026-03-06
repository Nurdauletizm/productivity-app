"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./KanbanColumn";
import { EditTaskModal } from "./EditTaskModal";
import { Task, TaskStatus } from "./TaskCard";

interface BoardData {
    tasks: Record<string, Task>;
    columns: Record<
        TaskStatus,
        {
            id: TaskStatus;
            title: string;
            taskIds: string[];
        }
    >;
    columnOrder: TaskStatus[];
}

const emptyData: BoardData = {
    tasks: {},
    columns: {
        BACKLOG: { id: "BACKLOG", title: "Backlog (To Do)", taskIds: [] },
        IN_PROGRESS: { id: "IN_PROGRESS", title: "In Progress", taskIds: [] },
        DONE: { id: "DONE", title: "Done", taskIds: [] },
    },
    columnOrder: ["BACKLOG", "IN_PROGRESS", "DONE"],
};

interface KanbanBoardProps {
    newTask?: {
        title: string;
        description: string;
        deadline: string;
        status: TaskStatus;
        goalId: string;
        labels: string[];
        id: string;
    } | null;
    goalId?: string;
}

export function KanbanBoard({ newTask, goalId }: KanbanBoardProps) {
    const [data, setData] = useState<BoardData>(emptyData);
    const [isClient, setIsClient] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { data: dbTasks, isLoading, mutate } = useSWR<Task[]>(
        goalId ? `/api/tasks?goalId=${goalId}` : "/api/tasks",
        fetcher
    );

    // Fix hydration issues with drag and drop
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (dbTasks) {
            const newData: BoardData = JSON.parse(JSON.stringify(emptyData)); // deep copy empty struct

            dbTasks.forEach((dbTask: any) => {
                const task: Task = {
                    ...dbTask,
                    labels: typeof dbTask.labels === 'string' && dbTask.labels.trim() !== ''
                        ? dbTask.labels.split(',')
                        : dbTask.labels || []
                };
                newData.tasks[task.id] = task;
                const status = task.status as TaskStatus;
                if (newData.columns[status]) {
                    newData.columns[status].taskIds.push(task.id);
                } else {
                    newData.columns.BACKLOG.taskIds.push(task.id);
                }
            });

            setData(newData);
        }
    }, [dbTasks]);

    // Listen for new tasks created from the modal
    useEffect(() => {
        if (newTask) {
            const createApiTask = async () => {
                try {
                    const res = await fetch("/api/tasks", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: newTask.title,
                            description: newTask.description,
                            deadline: newTask.deadline,
                            status: newTask.status,
                            goalId: newTask.goalId || undefined,
                            labels: newTask.labels.length > 0 ? newTask.labels : ["new"]
                        })
                    });

                    if (!res.ok) throw new Error("Failed to create task");

                    const createdTask: Task = await res.json();

                    setData((prevData) => {
                        if (prevData.tasks[createdTask.id]) return prevData;

                        const colId = createdTask.status as TaskStatus;
                        const newColumn = {
                            ...prevData.columns[colId],
                            taskIds: [createdTask.id, ...prevData.columns[colId].taskIds]
                        };

                        return {
                            ...prevData,
                            tasks: {
                                ...prevData.tasks,
                                [createdTask.id]: createdTask
                            },
                            columns: {
                                ...prevData.columns,
                                [colId]: newColumn
                            }
                        };
                    });

                    mutate();
                } catch (error) {
                    console.error(error);
                }
            };

            createApiTask();
        }
    }, [newTask]);

    const onDragEnd = useCallback(async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const startColumn = data.columns[source.droppableId as TaskStatus];
        const finishColumn = data.columns[destination.droppableId as TaskStatus];

        // Optimistically update UI
        if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...startColumn, taskIds: newTaskIds };

            setData((prev) => ({
                ...prev,
                columns: { ...prev.columns, [newColumn.id]: newColumn },
            }));
            return;
        }

        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = { ...startColumn, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finishColumn, taskIds: finishTaskIds };

        const updatedTask = {
            ...data.tasks[draggableId],
            status: finishColumn.id as TaskStatus,
        };

        setData((prev) => ({
            ...prev,
            tasks: { ...prev.tasks, [draggableId]: updatedTask },
            columns: {
                ...prev.columns,
                [newStart.id]: newStart,
                [newFinish.id]: newFinish,
            },
        }));

        // Persist to DB
        try {
            await fetch(`/api/tasks/${draggableId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: finishColumn.id })
            });
            mutate();
        } catch (error) {
            console.error("Failed to update task status in DB", error);
            // Optional: rollback UI state here if database fails
        }
    }, [data, mutate]);

    if (!isClient) {
        return null;
    }

    if (isLoading || !dbTasks) {
        return <div className="h-full flex items-center justify-center text-gray-400">Loading board...</div>;
    }

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

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

            setData((prevData) => {
                const newData = { ...prevData };

                // If status changed, we need to move the task between columns
                if (updatedData.status && updatedData.status !== prevData.tasks[taskId].status) {
                    const oldStatus = prevData.tasks[taskId].status;
                    const newStatus = updatedData.status;

                    // Remove from old column
                    newData.columns[oldStatus].taskIds = newData.columns[oldStatus].taskIds.filter(id => id !== taskId);

                    // Add to new column (top)
                    newData.columns[newStatus].taskIds = [taskId, ...newData.columns[newStatus].taskIds];
                }

                // Update task data
                newData.tasks[taskId] = { ...prevData.tasks[taskId], ...formattedTask };

                return newData;
            });

            mutate();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete task");

            setData((prevData) => {
                const newData = { ...prevData };
                const task = newData.tasks[taskId];
                if (!task) return newData;
                const status = task.status;

                // Remove from columns
                newData.columns[status].taskIds = newData.columns[status].taskIds.filter(id => id !== taskId);

                // Remove from tasks dictionary
                delete newData.tasks[taskId];

                return newData;
            });
            setSelectedTask(null);
            mutate();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 h-full p-8 overflow-x-auto items-start">
                    {data.columnOrder.map((columnId) => {
                        const column = data.columns[columnId];
                        const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                        return (
                            <KanbanColumn
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                tasks={tasks}
                                onTaskClick={handleTaskClick}
                            />
                        );
                    })}
                </div>
            </DragDropContext>

            <EditTaskModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onSubmit={handleEditTask}
                onDelete={handleDeleteTask}
            />
        </>
    );
}
