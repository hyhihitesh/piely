"use server";

import { createClient } from "@/utils/supabase/server";

export async function fetchNodeContext(nodeId: string) {
    const supabase = await createClient();

    // 1. Fetch text data
    const { data: node } = await supabase
        .from("roadmap_nodes")
        .select("*, roadmaps(title, idea_description)")
        .eq("id", nodeId)
        .single();

    if (!node) return null;

    // 2. Fetch Siblings (nodes in same stage)
    const metadata = node.metadata as Record<string, unknown> | null;
    let siblings: { title: string | null; metadata?: unknown }[] = [];
    if (metadata?.stageId) {
        const { data: sibs } = await supabase
            .from("roadmap_nodes")
            .select("title")
            .eq("roadmap_id", node.roadmap_id)
            .neq("id", nodeId);  // Exclude self

        // Filter manually for stageId if it's in metadata (JSON col processing is easier in JS)
        siblings = (sibs || []).filter(s => {
            const sibMeta = (s as { metadata?: Record<string, unknown> }).metadata;
            return sibMeta?.stageId === metadata?.stageId;
        });
    }

    return {
        node,
        project: node.roadmaps,
        siblings: siblings.map(s => s.title)
    };
}
