"use client";

import React from 'react';
import { ChartBlock as ChartBlockType } from '@/lib/os-blocks';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export function ChartBlock({ block }: { block: ChartBlockType }) {
    const { title, chartType, data, dataKey, series, height = 300 } = block;

    // Guard against null data or series
    if (!data || !series || data.length === 0 || series.length === 0) {
        return (
            <div className="p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-md text-center text-gray-500">
                No chart data available
            </div>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <defs>
                            {series.map((s, i) => (
                                <linearGradient key={s.key} id={`color${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey={dataKey ?? undefined} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        {series.map((s, i) => (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                fillOpacity={1}
                                fill={`url(#color${s.key})`}
                            />
                        ))}
                    </AreaChart>
                );

            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey={dataKey ?? undefined} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        {series.map((s, i) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.label}
                                fill={s.color || COLORS[i % COLORS.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey={dataKey ?? undefined} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        {series.map((s, i) => (
                            <Line
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                );

            case 'pie':
                // For pie, we assume the first series key is the value
                const valueKey = series[0]?.key || 'value';
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey={valueKey}
                            nameKey={dataKey ?? undefined}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color as string || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );

            default:
                return <div>Unsupported chart type</div>;
        }
    };

    return (
        <div className="p-6 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-md">
            {title && (
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                    {title}
                </h3>
            )}
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
