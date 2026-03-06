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

interface ActivityChartProps {
    data: Array<{ name: string; completed: number; created: number }>;
}

export function ActivityChart({ data }: ActivityChartProps) {
    return (
        <div className="h-[300px] w-full bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-6">This Week's Activity</h3>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="completed" fill="#000000" radius={[4, 4, 0, 0]} barSize={32} name="Tasks Completed" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
