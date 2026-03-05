// Goal progress utility
export function calculateGoalProgress(tasks: { status: string }[]) {
    if (!tasks || tasks.length === 0) return 0;

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "DONE").length;

    return Math.round((completed / total) * 100);
}
