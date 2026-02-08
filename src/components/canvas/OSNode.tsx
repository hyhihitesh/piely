"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { RoadmapNodeData } from "@/lib/roadmapTypes";
import { OSModuleData } from "@/lib/os-blocks";
import { MetricBlock } from "./blocks/MetricBlock";
import { ChartBlock } from "./blocks/ChartBlock";
import { TableBlock } from "./blocks/TableBlock";
import { cn } from "@/lib/utils";

const MarkdownBlock = ({ content }: { content: string }) => (
    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm h-full overflow-auto text-sm prose prose-neutral dark:prose-invert max-w-none">
        {content}
    </div>
);

export const OSNode = memo(({ data, selected }: NodeProps<RoadmapNodeData>) => {
    // Extract OS Module Data safely
    const itemData = data.itemData;
    const metadata = itemData?.metadata;

    if (metadata?.type !== "os_module" || !metadata.data) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-sm text-destructive">
                Invalid OS Module Data
            </div>
        );
    }

    const moduleData = metadata.data as OSModuleData;
    const { title, description, layout } = moduleData;

    // Determine Theme based on Module Type
    const moduleType = (metadata.moduleType as string) || "default";

    const THEMES = {
        hq: {
            border: "border-amber-500/50",
            ring: "ring-amber-500/20",
            bg: "bg-amber-500/5",
            header: "bg-amber-500/10",
            icon: "bg-amber-500",
            text: "text-amber-500"
        },
        market: {
            border: "border-cyan-500/50",
            ring: "ring-cyan-500/20",
            bg: "bg-cyan-500/5",
            header: "bg-cyan-500/10",
            icon: "bg-cyan-500",
            text: "text-cyan-500"
        },
        product: {
            border: "border-violet-500/50",
            ring: "ring-violet-500/20",
            bg: "bg-violet-500/5",
            header: "bg-violet-500/10",
            icon: "bg-violet-500",
            text: "text-violet-500"
        },
        gtm: {
            border: "border-emerald-500/50",
            ring: "ring-emerald-500/20",
            bg: "bg-emerald-500/5",
            header: "bg-emerald-500/10",
            icon: "bg-emerald-500",
            text: "text-emerald-500"
        },
        default: {
            border: "border-border",
            ring: "ring-primary/10",
            bg: "bg-background/95",
            header: "bg-muted/30",
            icon: "bg-primary",
            text: "text-primary"
        }
    };

    // @ts-ignore
    const theme = THEMES[moduleType] || THEMES.default;

    // Determine width based on content complexity (Adaptive Container)
    const hasComplexBlocks = layout.some(b => b.type === "chart" || b.type === "table" || (b.colSpan ?? 1) > 2);
    const isWide = hasComplexBlocks || layout.length > 3;

    return (
        <div
            className={cn(
                // Base: Notion-style card (Clean, simple border, no heavy shadow)
                "rounded-lg border transition-all duration-200 group bg-card text-card-foreground",
                // Hover: Subtle lift, no glow
                selected ? `ring-2 ring-offset-1 ring-offset-background ${theme.ring} ${theme.border}` : `hover:border-primary/30 ${theme.border}`,
                // Blueprint Mode: This will auto-adapt because --card and --border are redefined in globals.css
                isWide ? "w-[1000px]" : "w-[480px]"
            )}
        >
            {/* Header */}
            <div className={cn("px-5 py-3 border-b flex items-center justify-between", theme.header, theme.border)}>
                <div>
                    <div className="flex items-center gap-2">
                        {/* Status Dot (Static, no pulse) */}
                        <div className={cn("w-2.5 h-2.5 rounded-full", theme.icon)} />
                        {/* Title: Serif/Sans mix for Notion feel */}
                        <h3 className={cn("font-heading font-semibold text-lg tracking-tight", theme.text)}>{title}</h3>
                    </div>
                    {description && <p className="text-xs text-muted-foreground mt-0.5 ml-4.5">{description}</p>}
                </div>
                {/* Type Badge (Minimalist) */}
                <span className={cn("text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border opacity-70", theme.border, theme.text)}>
                    {moduleType}
                </span>
            </div>

            {/* Grid Layout */}
            <div className={cn(
                "p-6 grid gap-6",
                isWide ? "grid-cols-4" : "grid-cols-2"
            )}>
                {layout.map((block, i) => {
                    const span = block.colSpan ?? 1;
                    const colSpan = `col-span-${span}`;

                    return (
                        <div key={block.id || i} className={cn(colSpan, "min-h-[140px]")}>
                            {block.type === "metric" && <MetricBlock block={block} />}
                            {block.type === "chart" && <ChartBlock block={block} />}
                            {block.type === "table" && <TableBlock block={block} />}
                            {block.type === "markdown" && <MarkdownBlock content={block.content || ""} />}
                        </div>
                    );
                })}
            </div>

            {/* Connection Handles (Minimal, only show on hover/select to keep clean) */}
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground/30 !w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground/30 !w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="target" position={Position.Left} className="!bg-muted-foreground/30 !w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Handle type="source" position={Position.Right} className="!bg-muted-foreground/30 !w-2 !h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
});

OSNode.displayName = "OSNode";
