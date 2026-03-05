"use client";

import { useState, useEffect } from "react";
import { Task } from "@/components/TaskCard";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();

        // Format labels safely from SQLite string type
        const formattedTasks = data.map((task: any) => ({
          ...task,
          labels: typeof task.labels === 'string' && task.labels.trim() !== ''
            ? task.labels.split(',')
            : task.labels || []
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is an overview of your progress.</p>
      </header>

      <main className="flex-1 p-8 text-gray-500 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center text-gray-400 mt-10">Loading insights...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Total Tasks</h3>
              <p className="text-3xl font-bold text-black">{totalTasks}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
