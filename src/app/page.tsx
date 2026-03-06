"use client";

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ActivityChart } from "@/components/ActivityChart";
import { CheckCircle2, Circle, Clock, Target, CalendarDays, TrendingUp } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

export default function Home() {
  const { isLoading, metrics, activityData, upcomingTasks, goalsProgress } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-gray-400">
        Loading insights...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fbfbfa]">
      <header className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-10 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here is a snapshot of your productivity and upcoming goals.</p>
      </header>

      <main className="flex-1 p-8 overflow-y-auto space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg"><Target className="w-5 h-5 text-gray-600" /></div>
              <h3 className="font-medium text-gray-600 text-sm">Total Tasks</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metrics.totalTasks}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-medium text-gray-600 text-sm">In Progress</h3>
            </div>
            <p className="text-3xl font-semibold text-blue-600">{metrics.inProgressTasks}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
              <h3 className="font-medium text-gray-600 text-sm">Completed</h3>
            </div>
            <p className="text-3xl font-semibold text-green-600">{metrics.completedTasks}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg"><TrendingUp className="w-5 h-5 text-orange-600" /></div>
              <h3 className="font-medium text-gray-600 text-sm">Completion Rate</h3>
            </div>
            <p className="text-3xl font-semibold text-orange-600">{metrics.completionRate}%</p>
          </div>
        </div>

        {/* Chart Row */}
        <div className="w-full">
          <ActivityChart data={activityData} />
        </div>

        {/* Lower Section: Deadlines & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-500" />
                Upcoming Deadlines
              </h3>
              <Link href="/calendar" className="text-sm text-gray-500 hover:text-black hover:underline transition-colors">
                View Calendar
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No urgent tasks due today or tomorrow. 🎉</p>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="w-5 h-5 text-gray-300 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === "DONE" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {task.title}
                      </p>
                      {task.deadline && (
                        <p className="text-xs text-red-500 mt-0.5">
                          Due {format(parseISO(task.deadline), "MMM d")}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Active Goals
              </h3>
              <Link href="/goals" className="text-sm text-gray-500 hover:text-black hover:underline transition-colors">
                View All
              </Link>
            </div>

            <div className="space-y-6">
              {goalsProgress.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No goals tracked yet.</p>
              ) : (
                goalsProgress.map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Link href={`/goals/${goal.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {goal.title}
                      </Link>
                      <span className="text-xs text-gray-500 font-medium">
                        {goal.completedTasks} / {goal.totalTasks} ({goal.progress}%)
                      </span>
                    </div>
                    {/* Progress bar container */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
