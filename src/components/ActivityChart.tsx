"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface ActivityChartProps {
    data: Array<{ name: string; completed: number; created: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="h-[300px] w-full bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col transition-colors">
            <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-6">This Week's Activity</h3>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#f3f4f6"} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#6b7280' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: isDark ? '#a1a1aa' : '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: isDark ? '#27272a' : '#f9fafb' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: isDark ? '1px solid #27272a' : 'none',
                                backgroundColor: isDark ? '#18181b' : '#ffffff',
                                color: isDark ? '#ffffff' : '#000000',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: isDark ? '#a1a1aa' : '#6b7280' }}
                        />
                        <Bar
                            dataKey="completed"
                            fill={isDark ? "#ffffff" : "#000000"}
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                            name="Tasks Completed"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
