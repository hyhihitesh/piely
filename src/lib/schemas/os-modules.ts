import { z } from "zod";

// Combined Block Schema (Flattened and Strict for AI compatibility)
// OpenAI Structured Outputs require strictly defined objects. 
// We use nullable() instead of optional() effectively for all 'optional' fields.

export const OSBlockSchema = z.object({
    type: z.enum(["metric", "chart", "table", "markdown"]),

    // Common properties
    colSpan: z.enum(["1", "2", "3", "4"]).transform(Number).nullable().describe("Grid width 1-4"),
    title: z.string().nullable(),

    // Metric props
    label: z.string().nullable(),
    value: z.union([z.string(), z.number()]).nullable(),
    trend: z.object({
        value: z.number(),
        direction: z.enum(["up", "down", "neutral"]),
        label: z.string().nullable(),
    }).nullable(),
    details: z.string().nullable(),
    variant: z.enum(["default", "highlight", "danger", "success"]).nullable(),

    // Chart props
    chartType: z.enum(["bar", "line", "area", "pie"]).nullable(),
    dataKey: z.string().describe("Key for X-axis").nullable(),
    series: z.array(z.object({
        key: z.string(),
        label: z.string(),
        color: z.string().nullable(),
    })).nullable(),

    // Table/Chart props (Data)
    columns: z.array(z.object({
        key: z.string(),
        label: z.string(),
        format: z.enum(["currency", "percent", "number", "text"]).nullable(),
    })).nullable(),

    // Shared data array - STRINGIFIED JSON to avoid schema complexity limits
    data: z.string().describe("JSON stringified array of data objects. Example: '[{\"month\": \"Jan\", \"val\": 10}]'").nullable(),

    // Markdown props
    content: z.string().nullable(),
});

// Module Schema (The whole node)
export const OSModuleSchema = z.object({
    title: z.string(),
    description: z.string().nullable(),
    layout: z.array(OSBlockSchema),
});
