"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

type RoadmapNodeInsert = Database["public"]["Tables"]["roadmap_nodes"]["Insert"];

export interface AINodeData {
    title: string;
    description: string;
    type: "product" | "gtm" | "hiring" | "funding" | "operations";
    stageId?: string;
}

export interface CreateAINodeResult {
    success: boolean;
    nodeId?: string;
    error?: string;
}

/**
 * Creates a new node on the canvas from AI-generated data.
 * This is the core action for the canvas-based AI response USP.
 */
export async function createAINode(
    projectId: string,
    nodeData: AINodeData
): Promise<CreateAINodeResult> {
    try {
        const supabase = await createClient<Database>();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Verify project ownership
        const { data: roadmap, error: roadmapError } = await supabase
            .from("roadmaps")
            .select("id, user_id")
            .eq("id", projectId)
            .single();

        if (roadmapError || !roadmap) {
            return { success: false, error: "Project not found" };
        }

        if (roadmap.user_id !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get the highest order_index for positioning
        const { data: existingNodes } = await supabase
            .from("roadmap_nodes")
            .select("order_index, metadata")
            .eq("roadmap_id", projectId)
            .order("order_index", { ascending: false })
            .limit(1);

        const lastOrderIndex = existingNodes?.[0]?.order_index ?? -1;
        const newOrderIndex = lastOrderIndex + 1;

        // Calculate position based on existing nodes
        const lastMetadata = existingNodes?.[0]?.metadata as Record<string, unknown> | null;
        const lastX = typeof lastMetadata?.x === 'number' ? lastMetadata.x : 0;
        const newX = lastX + 280; // Offset for new node

        // Insert the new node
        const nodeToInsert: RoadmapNodeInsert = {
            roadmap_id: projectId,
            title: nodeData.title,
            description: nodeData.description,
            type: nodeData.type, // Database now accepts: stage, item, product, gtm, hiring, funding, operations
            status: "pending",
            order_index: newOrderIndex,
            metadata: {
                x: newX,
                y: 120, // Offset below header
                stageId: nodeData.stageId || "validation",
                category: nodeData.type, // Store the actual category here
                source: "ai_chat", // Mark as AI-generated from chat
                createdAt: new Date().toISOString(),
            },
        };

        const { data: newNode, error: insertError } = await supabase
            .from("roadmap_nodes")
            .insert(nodeToInsert)
            .select("id")
            .single();

        if (insertError || !newNode) {
            console.error("Failed to insert AI node:", insertError);
            return { success: false, error: "Failed to create node" };
        }

        // Revalidate the project page to show the new node
        revalidatePath(`/project/${projectId}`);

        return { success: true, nodeId: newNode.id };
    } catch (error) {
        console.error("createAINode error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
