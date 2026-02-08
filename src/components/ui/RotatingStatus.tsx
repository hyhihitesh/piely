"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ARCHITECT_STATUSES = [
    "Synthesizing market signals...",
    "Calculating problem-solution fit...",
    "Architecting structural roadmap...",
    "Analyzing venture-scale potential...",
    "Extracting core product logic...",
    "Predicting growth levers...",
    "Optimizing unit economics...",
    "Mapping competitive landscape..."
];

interface RotatingStatusProps {
    className?: string;
    textClassName?: string;
}

export function RotatingStatus({ className, textClassName }: RotatingStatusProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % ARCHITECT_STATUSES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
            </div>
            <span className={cn("text-sm italic text-muted-foreground font-medium animate-pulse", textClassName)}>
                {ARCHITECT_STATUSES[index]}
            </span>
        </div>
    );
}
