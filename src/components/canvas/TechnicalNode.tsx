import { memo } from "react";
import { Handle, Position } from "reactflow";
import { CheckCircle2, Circle, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import type { RoadmapNodeData, NodeStatus } from "@/lib/roadmapTypes";
import { MetricBlock } from "@/components/canvas/MetricBlock";

interface TechnicalNodeProps {
    data: RoadmapNodeData;
    selected?: boolean;
}

// Visual styling based on node status
const STATUS_STYLES: Record<NodeStatus, { border: string; opacity: string; accent: string }> = {
    active: {
        border: "border-orange-500 border-2",
        opacity: "opacity-100",
        accent: "text-orange-500",
    },
    completed: {
        border: "border-green-500 border",
        opacity: "opacity-70",
        accent: "text-green-500",
    },
    projected: {
        border: "border-blue-500 border-dashed",
        opacity: "opacity-40",
        accent: "text-blue-500",
    },
    locked: {
        border: "border-muted-foreground/40 border-dotted",
        opacity: "opacity-25",
        accent: "text-muted-foreground",
    },
};

export const TechnicalNode = memo(({ data, selected }: TechnicalNodeProps) => {
    const isCompleted = data.isCompleted || data.nodeStatus === "completed";
    const isStage = data.type === "stage";

    // Determine status from data or infer from isCompleted
    const status: NodeStatus = data.nodeStatus || (isCompleted ? "completed" : "active");
    const styles = STATUS_STYLES[status];

    // Status icon based on node state
    const StatusIcon = () => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "projected":
                return <Sparkles className="w-4 h-4 text-blue-500" />;
            case "locked":
                return <Lock className="w-4 h-4 text-muted-foreground/50" />;
            default:
                return <Circle className={cn("w-4 h-4", styles.accent)} />;
        }
    };

    return (
        <div
            className={cn(
                "relative min-w-[200px] bg-background px-4 py-3 shadow-sm transition-all duration-300 rounded-sm",
                styles.border,
                styles.opacity,
                selected && "ring-2 ring-offset-2 ring-orange-500/50 bg-gray-50 dark:bg-zinc-900"
            )}
        >
            {/* Handles */}
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-1 !h-1 !min-w-[4px] !min-h-[4px]" />

            <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="mt-0.5">
                    <StatusIcon />
                </div>

                {/* Content */}
                <div className="w-full">
                    <h3 className={cn(
                        "font-medium text-sm font-heading",
                        isStage && "uppercase tracking-wider text-xs",
                        status === "projected" && "text-blue-400"
                    )}>
                        {data.label}
                    </h3>
                    {data.itemData?.category && (
                        <span className="text-[10px] text-muted-foreground uppercase font-mono mt-1 block">
                            {data.itemData.category}
                        </span>
                    )}
                    {status === "projected" && (
                        <span className="text-[9px] text-blue-400 uppercase font-mono mt-1 block">
                            Future Milestone
                        </span>
                    )}

                    {/* Live Metrics */}
                    {(data.itemData?.id || data.stageData?.id) && (
                        <MetricBlock nodeId={data.itemData?.id || data.stageData?.id || ""} />
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-1 !h-1 !min-w-[4px] !min-h-[4px]" />
        </div>
    );
});

TechnicalNode.displayName = "TechnicalNode";
