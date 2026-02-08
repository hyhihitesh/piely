"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import type { StartupStage } from "@/lib/stages";

interface AcceleratorTrackProps {
    currentStage: StartupStage;
    completedStages?: StartupStage[];
    className?: string;
}

const STAGES: { id: StartupStage; label: string; shortLabel: string }[] = [
    { id: "validation", label: "Validation & Research", shortLabel: "Validation" },
    { id: "build", label: "Build & MVP", shortLabel: "Build" },
    { id: "growth", label: "Growth & Scale", shortLabel: "Growth" },
];

export const AcceleratorTrack = memo(function AcceleratorTrack({
    currentStage,
    completedStages = [],
    className,
}: AcceleratorTrackProps) {
    const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
    const progressPercent = ((currentIndex + 1) / STAGES.length) * 100;

    return (
        <div
            className={cn(
                "absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto",
                "bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-lg px-6 py-4",
                className
            )}
        >
            {/* Stage Indicators */}
            <div className="flex items-center gap-2 mb-3">
                {STAGES.map((stage, index) => {
                    const isCompleted = completedStages.includes(stage.id);
                    const isCurrent = stage.id === currentStage;
                    const isFuture = index > currentIndex;

                    return (
                        <div key={stage.id} className="flex items-center">
                            {/* Stage Dot & Label */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-4 h-4 rounded-full border-2 transition-all duration-300",
                                        isCompleted && "bg-green-500 border-green-500",
                                        isCurrent && "bg-orange-500 border-orange-500 ring-4 ring-orange-500/20",
                                        isFuture && "bg-transparent border-muted-foreground/40"
                                    )}
                                >
                                    {isCompleted && (
                                        <svg className="w-full h-full text-white p-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs mt-1.5 font-medium whitespace-nowrap",
                                        isCurrent && "text-orange-500",
                                        isCompleted && "text-green-500",
                                        isFuture && "text-muted-foreground/60"
                                    )}
                                >
                                    {stage.shortLabel}
                                </span>
                            </div>

                            {/* Connector Line */}
                            {index < STAGES.length - 1 && (
                                <div
                                    className={cn(
                                        "w-16 h-0.5 mx-3 transition-all duration-300",
                                        index < currentIndex
                                            ? "bg-gradient-to-r from-green-500 to-green-500"
                                            : index === currentIndex
                                                ? "bg-gradient-to-r from-orange-500 to-muted-foreground/30"
                                                : "bg-muted-foreground/20"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Progress Label */}
            <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                    Accelerator Progress
                </span>
                <span className="text-xs font-bold text-foreground">
                    {Math.round(progressPercent)}%
                </span>
            </div>
        </div>
    );
});
