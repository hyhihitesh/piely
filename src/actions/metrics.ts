"use server";

import { createClient } from "@/utils/supabase/server";

export interface Metric {
    id: string;
    label: string;
    value: string;
    trend: "up" | "down" | "neutral" | null;
}

export async function fetchNodeMetrics(nodeId: string): Promise<Metric[]> {
    const supabase = await createClient();

    const { data } = await supabase
        .from("node_metrics")
        .select("*")
        .eq("node_id", nodeId)
        .order("created_at", { ascending: true }); // Show oldest first or by specific order

    if (!data) return [];

    return data.map(m => ({
        id: m.id,
        label: m.label,
        value: m.value,
        trend: m.trend as "up" | "down" | "neutral" | null
    }));
}

import { z } from "zod";

const AddMetricSchema = z.object({
    nodeId: z.string().uuid(),
    label: z.string().min(1),
    value: z.string().min(1),
    trend: z.enum(["up", "down", "neutral"]).optional()
});

export async function addNodeMetric(nodeId: string, label: string, value: string, trend?: "up" | "down" | "neutral") {
    const output = AddMetricSchema.safeParse({ nodeId, label, value, trend });

    if (!output.success) {
        return { error: "Validation Failed: " + output.error.issues.map(i => i.message).join(", ") };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("node_metrics").insert({
        node_id: nodeId,
        label,
        value,
        trend
    });

    if (error) return { error: error.message };
    return { success: true };
}
