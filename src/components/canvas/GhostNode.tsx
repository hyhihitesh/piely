import { memo } from "react";
import { Handle, Position } from "reactflow";
import { MessageSquareWarning, Lightbulb } from "lucide-react";
import { RoadmapNodeData } from "@/lib/roadmapTypes";
import { cn } from "@/lib/utils";

interface GhostNodeProps {
    data: RoadmapNodeData;
    selected?: boolean;
}

export const GhostNode = memo(({ data, selected }: GhostNodeProps) => {
    // Extract metadata for critique details
    const meta = data.itemData?.metadata as Record<string, any> | undefined;
    const severity = meta?.severity || "suggestion"; // "warning" | "suggestion"

    // Theme: Yellow for suggestions, Red/Orange for warnings
    const isWarning = severity === "warning";

    return (
        <div className={cn(
            "relative group transition-all duration-300",
            // Sticky Note Look: Slight shadow, minimal border
            "w-[240px] p-4 rounded-sm shadow-md",
            isWarning
                ? "bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 text-red-900 dark:text-red-100"
                : "bg-yellow-50 dark:bg-yellow-950/40 border-l-4 border-yellow-500 text-yellow-900 dark:text-yellow-100",
            selected && "ring-2 ring-primary ring-offset-2"
        )}>
            {/* Header Icon */}
            <div className="absolute -top-3 -left-3 bg-background rounded-full p-1.5 border shadow-sm">
                {isWarning ? (
                    <MessageSquareWarning className="w-4 h-4 text-red-500" />
                ) : (
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                )}
            </div>

            {/* Critique Content */}
            <div className="mt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
                    {data.label || "AI Insight"}
                </h4>
                <p className="text-sm font-medium leading-snug font-handwriting opacity-90">
                    {/* If description exists use it, otherwise label */}
                    {data.itemData?.description || data.label}
                </p>
            </div>

            {/* Connector Handles (Invisible, just for dagre/anchoring) */}
            <Handle type="target" position={Position.Top} className="!opacity-0" />
            <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        </div>
    );
});

GhostNode.displayName = "GhostNode";
