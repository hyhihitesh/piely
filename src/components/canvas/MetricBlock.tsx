"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchNodeMetrics, Metric } from "@/actions/metrics";
import { cn } from "@/lib/utils";

interface MetricBlockProps {
    nodeId: string;
    className?: string;
}

export function MetricBlock({ nodeId, className }: MetricBlockProps) {
    const [metrics, setMetrics] = useState<Metric[]>([]);

    useEffect(() => {
        fetchNodeMetrics(nodeId).then(setMetrics);
    }, [nodeId]);

    if (metrics.length === 0) return null;

    return (
        <div className={cn("grid grid-cols-2 gap-2 mt-2", className)}>
            {metrics.map((metric) => (
                <div
                    key={metric.id}
                    className="bg-background/90 backdrop-blur-sm border rounded px-2 py-1.5 flex flex-col shadow-sm"
                >
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{metric.label}</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold font-mono text-foreground">{metric.value}</span>
                        {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                        {metric.trend === 'neutral' && <Minus className="w-3 h-3 text-yellow-500" />}
                    </div>
                </div>
            ))}
        </div>
    );
}
