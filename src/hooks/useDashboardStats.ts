import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Task } from "@/components/TaskCard";
import { Goal } from "@/components/GoalCard";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, isSameDay, isToday, isTomorrow, isAfter, startOfDay } from "date-fns";

export function useDashboardStats() {
    const { data: rawTasks, isLoading: isTasksLoading } = useSWR<Task[]>("/api/tasks", fetcher);
    const { data: rawGoals, isLoading: isGoalsLoading } = useSWR<Goal[]>("/api/goals", fetcher);

    // Format tasks and goals safely
    const tasks = rawTasks ? rawTasks.map((task: any) => ({
        ...task,
        labels: typeof task.labels === 'string' && task.labels.trim() !== ''
            ? task.labels.split(',')
            : task.labels || []
    })) : [];

    const goals = rawGoals || [];

    // 1. Summary Metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Activity Chart Data (Tasks marked as DONE this week)
    // Note: Since we don't track 'completedAt' precisely in the DB schema right now, 
    // we'll approximate by checking tasks whose updatedAt/createdAt falls in this week. 
    // Ideally, a `completedAt` timestamp should be added to the DB for perfect accuracy.
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const activityData = weekDays.map(day => {
        // Count tasks completed on this day (approximate with updatedAt)
        const completedOnDay = tasks.filter(t => {
            if (t.status !== "DONE" || !t.updatedAt) return false;
            const updatedDate = typeof t.updatedAt === "string" ? parseISO(t.updatedAt) : new Date(t.updatedAt);
            return isSameDay(updatedDate, day);
        }).length;

        // Count tasks created on this day
        const createdOnDay = tasks.filter(t => {
            if (!t.createdAt) return false;
            const createdDate = typeof t.createdAt === "string" ? parseISO(t.createdAt) : new Date(t.createdAt);
            return isSameDay(createdDate, day);
        }).length;

        return {
            name: format(day, "EEE"), // Mon, Tue, Wed
            completed: completedOnDay,
            created: createdOnDay
        };
    });

    // 3. Upcoming Deadlines (Due today or tomorrow and NOT done)
    const upcomingTasks = tasks.filter(t => {
        if (t.status === "DONE" || !t.deadline) return false;
        const deadlineDate = parseISO(t.deadline);
        // Is it today or tomorrow, or already overdue?
        return isToday(deadlineDate) || isTomorrow(deadlineDate) || isAfter(startOfDay(today), deadlineDate);
    }).sort((a, b) => {
        if (!a.deadline || !b.deadline) return 0;
        return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
    }).slice(0, 5); // Top 5

    // 4. Goals Progress
    const goalsProgress = goals.map(goal => {
        const goalTasks = tasks.filter(t => t.goalId === goal.id);
        const goalCompletedTasks = goalTasks.filter(t => t.status === "DONE").length;
        const goalTotalTasks = goalTasks.length;
        const progress = goalTotalTasks > 0 ? Math.round((goalCompletedTasks / goalTotalTasks) * 100) : 0;

        return {
            ...goal,
            progress,
            totalTasks: goalTotalTasks,
            completedTasks: goalCompletedTasks
        };
    });

    return {
        isLoading: isTasksLoading || isGoalsLoading,
        metrics: {
            totalTasks,
            completedTasks,
            inProgressTasks,
            completionRate
        },
        activityData,
        upcomingTasks,
        goalsProgress
    };
}
