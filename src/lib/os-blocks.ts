export type BlockType = "metric" | "chart" | "table" | "markdown";

export interface BaseBlock {
    id: string;
    type: BlockType;
    title?: string | null;
    colSpan?: number | null; // Changed to number | null to match Zod transform
}

export interface MetricBlock extends BaseBlock {
    type: "metric";
    label: string | null;
    value: string | number | null;
    trend?: {
        value: number;
        direction: "up" | "down" | "neutral";
        label?: string | null;
    } | null;
    details?: string | null;
    variant?: "default" | "highlight" | "danger" | "success" | null;
}

export interface ChartBlock extends BaseBlock {
    type: "chart";
    chartType: "bar" | "line" | "area" | "pie" | null;
    dataKey: string | null;
    series: {
        key: string;
        label: string;
        color?: string | null;
    }[] | null;
    data: Record<string, any>[] | null;
    height?: number;
}

export interface TableBlock extends BaseBlock {
    type: "table";
    columns: {
        key: string;
        label: string;
        format?: "currency" | "percent" | "number" | "text" | null;
    }[] | null;
    data: Record<string, any>[] | null;
}

export interface MarkdownBlock extends BaseBlock {
    type: "markdown";
    content: string | null;
}

export type OSBlock = MetricBlock | ChartBlock | TableBlock | MarkdownBlock;

export interface OSModuleData {
    title: string;
    description?: string | null;
    layout: OSBlock[];
}
