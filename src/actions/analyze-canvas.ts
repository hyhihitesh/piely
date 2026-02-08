"use server";

import { createClient } from "@/utils/supabase/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const critiqueSchema = z.object({
    critiques: z.array(z.object({
        relatedNodeId: z.string().describe("The ID of the node this critique applies to"),
        title: z.string().describe("Short punchy title of the insight (e.g. 'Missing Metric')"),
        message: z.string().describe("The critique or suggestion (max 2 sentences)"),
        severity: z.enum(["suggestion", "warning"]).describe("Severity of the issue"),
    }))
});

export async function analyzeCanvas(roadmapId: string) {
    const supabase = await createClient();

    // 1. Fetch current nodes
    const { data: nodes } = await supabase
        .from("roadmap_nodes")
        .select("id, title, description, metadata")
        .eq("roadmap_id", roadmapId)
        .neq("type", "ghost"); // Don't critique the critiques

    if (!nodes || nodes.length === 0) {
        return { error: "No nodes to analyze" };
    }

    // 2. Prepare Context for AI
    const canvasContext = nodes.map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        type: (n.metadata as Record<string, unknown>)?.moduleType || "generic"
    }));

    // 3. Generate Critique
    const result = await generateObject({
        model: openai("gpt-4o"), // Or "gpt-4-turbo"
        schema: critiqueSchema,
        prompt: `
      You are a YC Partner and Senior Product Architect.
      Review the following Startup Canvas items.
      Identify 3-5 critical gaps, risks, or improvement opportunities.
      
      Focus on:
      1. Vagueness ("Build App" vs "Launch MVP to 10 users")
      2. Missing GTM steps (Building without distribution)
      3. Unrealistic goals.
      
      Canvas Items:
      ${JSON.stringify(canvasContext, null, 2)}
      
      Return a list of critiques that should be attached to specific nodes.
    `,
    });

    const critiques = result.object.critiques;

    // 4. Insert Ghost Nodes
    // We need to fetch the positions of related nodes to place the ghost node nearby
    // ACTUALLY: We will just insert them, and let the Frontend (ReactFlow) or Layout Engine handle positioning initially?
    // Or we can try to copy the related node's position + offset.
    // For now, let's insert them with a temporary position (0,0) and let the Layout Engine logic update it?
    // Or better: We fetch positions from the Frontend? No, server doesn't know.
    // We will assume the frontend will receive the INSERT event and the Layout Engine will place them if the metadata links them.
    // Let's store 'relatedNodeId' in metadata.

    const critiqueNodes = critiques.map(c => ({
        roadmap_id: roadmapId,
        title: c.title,
        description: c.message,
        status: "projected", // Ghost nodes are always 'projected' (future/idea)
        metadata: {
            type: "ghost",
            severity: c.severity,
            relatedNodeId: c.relatedNodeId,
            // Default Position (will be adjusted)
            x: 0,
            y: 0
        }
    }));

    const { error } = await supabase
        .from("roadmap_nodes")
        .insert(critiqueNodes);

    if (error) {
        console.error("Failed to insert critiques:", error);
        return { error: error.message };
    }

    return { success: true, count: critiques.length };
}
