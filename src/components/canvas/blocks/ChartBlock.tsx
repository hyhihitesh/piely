"use client";

import React from "react";
import { ChartBlock as ChartBlockType } from "@/lib/os-blocks";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface ChartBlockProps {
    block: ChartBlockType;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ChartBlock({ block }: ChartBlockProps) {
    const { title, chartType, data, dataKey, series } = block;

    if (!data || data.length === 0 || !dataKey || !series || series.length === 0) {
        return (
            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm h-full flex items-center justify-center text-muted-foreground text-sm">
                Insufficient chart data
            </div>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case "bar":
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey={dataKey} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}
                            itemStyle={{ color: "#fff" }}
                        />
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
            case "line":
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey={dataKey} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}
                            itemStyle={{ color: "#fff" }}
                        />
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
            case "area":
                return (
                    <AreaChart data={data}>
                        <defs>
                            {series.map((s, i) => (
                                <linearGradient key={`gradient-${s.key}`} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={s.color || COLORS[i % COLORS.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey={dataKey} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}
                            itemStyle={{ color: "#fff" }}
                        />
                        {series.map((s, i) => (
                            <Area
                                key={s.key}
                                type="monotone"
                                dataKey={s.key}
                                name={s.label}
                                stroke={s.color || COLORS[i % COLORS.length]}
                                fillOpacity={1}
                                fill={`url(#gradient-${s.key})`}
                            />
                        ))}
                    </AreaChart>
                );
            case "pie":
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={series[0].key} // Pie usually uses first series value
                            nameKey={dataKey}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}
                            itemStyle={{ color: "#fff" }}
                        />
                    </PieChart>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm h-full flex flex-col">
            {title && <h4 className="text-sm font-medium mb-4">{title}</h4>}
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart() || <div>No Data</div>}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
