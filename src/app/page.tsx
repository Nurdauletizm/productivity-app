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
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#121212] text-gray-400 dark:text-zinc-500 transition-colors">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#0a0a0a] transition-colors">
      <header className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm z-10 shrink-0 transition-colors">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Обзор</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Сводка вашей продуктивности и целей.</p>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 md:space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-lg"><Target className="w-5 h-5 text-gray-600 dark:text-zinc-400" /></div>
              <h3 className="font-medium text-gray-600 dark:text-zinc-400 text-sm">Всего задач</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">{metrics.totalTasks}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
              <h3 className="font-medium text-gray-600 dark:text-zinc-400 text-sm">В процессе</h3>
            </div>
            <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">{metrics.inProgressTasks}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
              <h3 className="font-medium text-gray-600 dark:text-zinc-400 text-sm">Выполнено</h3>
            </div>
            <p className="text-3xl font-semibold text-green-600 dark:text-green-400">{metrics.completedTasks}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg"><TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
              <h3 className="font-medium text-gray-600 dark:text-zinc-400 text-sm">Процент выполнения</h3>
            </div>
            <p className="text-3xl font-semibold text-orange-600 dark:text-orange-400">{metrics.completionRate}%</p>
          </div>
        </div>

        {/* Chart Row */}
        <div className="w-full">
          <ActivityChart data={activityData} />
        </div>

        {/* Lower Section: Deadlines & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-red-500 dark:text-red-400" />
                Ближайшие дедлайны
              </h3>
              <Link href="/calendar" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline transition-colors">
                Календарь
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-zinc-500 py-4 text-center">Нет срочных задач на сегодня или завтра. 🎉</p>
              ) : (
                upcomingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-zinc-800 cursor-pointer">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="w-5 h-5 text-gray-300 dark:text-zinc-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-zinc-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === "DONE" ? "text-gray-400 dark:text-zinc-500 line-through" : "text-gray-900 dark:text-zinc-100"}`}>
                        {task.title}
                      </p>
                      {task.deadline && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                          Срок: {format(parseISO(task.deadline), "d MMM")}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Активные цели
              </h3>
              <Link href="/goals" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:underline transition-colors">
                Все цели
              </Link>
            </div>

            <div className="space-y-6">
              {goalsProgress.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-zinc-500 py-4 text-center">Пока нет целей.</p>
              ) : (
                goalsProgress.map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <Link href={`/goals/${goal.id}`} className="text-sm font-medium text-gray-900 dark:text-zinc-100 hover:underline">
                        {goal.title}
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                        {goal.completedTasks} / {goal.totalTasks} ({goal.progress}%)
                      </span>
                    </div>
                    {/* Progress bar container */}
                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out"
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
