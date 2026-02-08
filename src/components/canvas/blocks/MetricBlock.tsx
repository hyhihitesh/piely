import React from "react";
import { MetricBlock as MetricBlockType } from "@/lib/os-blocks";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricBlockProps {
    block: MetricBlockType;
}

export function MetricBlock({ block }: MetricBlockProps) {
    const { label, value, trend, details, variant = "default" } = block;

    const trendDirection = trend?.direction || "neutral";

    const trendColor =
        trendDirection === "up"
            ? "text-emerald-500"
            : trendDirection === "down"
                ? "text-rose-500"
                : "text-gray-500";

    const TrendIcon =
        trendDirection === "up"
            ? ArrowUp
            : trendDirection === "down"
                ? ArrowDown
                : Minus;

    return (
        <div
            className={cn(
                "p-6 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between h-full",
                variant === "highlight" && "border-primary/50 bg-primary/5",
                variant === "danger" && "border-rose-500/20 bg-rose-500/5",
                variant === "success" && "border-emerald-500/20 bg-emerald-500/5"
            )}
        >
            <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-display opacity-80 mb-2">{label || "Metric"}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-display tracking-tight">{value ?? "--"}</span>
                </div>
            </div>

            {(trend || details) && (
                <div className="mt-3 flex items-center justify-between text-xs">
                    {trend && (
                        <div className={cn("flex items-center gap-1 font-medium", trendColor)}>
                            <TrendIcon className="w-3 h-3" />
                            <span>{Math.abs(trend.value)}%</span>
                            {trend.label && <span className="text-muted-foreground ml-1 font-normal">{trend.label}</span>}
                        </div>
                    )}
                    {details && <span className="text-muted-foreground truncate ml-auto">{details}</span>}
                </div>
            )}
        </div>
    );
}
