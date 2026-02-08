"use server";

import { createClient } from "@/utils/supabase/server";
import { STAGES, StartupStage } from "@/lib/stages";
import { Database } from "@/lib/database.types";
import { generateStartupOS } from "@/actions/generate-startup-os";
import { CAMPUS_LAYOUT } from "@/lib/campus-layout";

type RoadmapNodeInsert = Database["public"]["Tables"]["roadmap_nodes"]["Insert"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createProject(idea: string, stage: StartupStage, _messages: unknown[] = []) {
    const supabase = await createClient<Database>();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    // 1. Create Roadmap with AI-detected stage
    const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
            user_id: user.id,
            title: idea || "Untitled Project",
            idea_description: idea,
            stage: stage, // Persist AI-detected stage for accelerator tracking
        })
        .select()
        .single();

    if (roadmapError || !roadmap) {
        throw new Error(roadmapError?.message || "Failed to create project");
    }

    // 2. Generate Startup OS (The 4 Quadrants)
    const osData = await generateStartupOS(idea);

    const nodesToInsert: RoadmapNodeInsert[] = [];
    const stageDef = STAGES[stage] || STAGES.validation;

    // Use a fixed order for consistency
    const quadrants = [
        { key: "hq", ...CAMPUS_LAYOUT.HQ, data: osData.hq, dbType: "operations" },
        { key: "market", ...CAMPUS_LAYOUT.MARKET, data: osData.market, dbType: "operations" }, // Market research categorized as Ops/Strategy
        { key: "product", ...CAMPUS_LAYOUT.PRODUCT, data: osData.product, dbType: "product" },
        { key: "gtm", ...CAMPUS_LAYOUT.GTM, data: osData.gtm, dbType: "gtm" },
    ];

    quadrants.forEach((quadrant, index) => {
        nodesToInsert.push({
            roadmap_id: roadmap.id,
            type: quadrant.dbType as "product" | "gtm" | "operations", // Database enum type
            title: quadrant.data.title,
            description: quadrant.data.description || quadrant.description,
            status: "in_progress", // DB constraint: pending | in_progress | completed
            order_index: index,
            metadata: {
                x: quadrant.x,
                y: quadrant.y,
                stageId: stageDef.id,
                type: "os_module",
                moduleType: quadrant.key,
                data: quadrant.data // Stores the rich Chart/Table content
            }
        });
    });

    // 3. Insert Nodes and Capture IDs
    const { data: insertedNodes, error: nodesError } = await supabase
        .from("roadmap_nodes")
        .insert(nodesToInsert)
        .select("id, metadata");

    if (nodesError || !insertedNodes) {
        console.error("Nodes creation failed:", nodesError);
        return { id: roadmap.id };
    }

    // 4. Create Edges (Logic Flow)
    // We need to map the inserted nodes back to their keys (hq, market, product, gtm)
    const nodeMap = new Map<string, string>(); // moduleType -> id

    insertedNodes.forEach(node => {
        const meta = node.metadata as Record<string, unknown> | null;
        if (meta?.moduleType && typeof meta.moduleType === 'string') {
            nodeMap.set(meta.moduleType, node.id);
        }
    });

    const edgesToInsert = [];
    const hqId = nodeMap.get("hq");
    const marketId = nodeMap.get("market");
    const productId = nodeMap.get("product");
    const gtmId = nodeMap.get("gtm");

    // Connect: HQ -> Product ("Vision drives Product")
    if (hqId && productId) {
        edgesToInsert.push({ roadmap_id: roadmap.id, from_node_id: hqId, to_node_id: productId, type: "precedes" });
    }
    // Connect: Market -> Product ("Market needs drive Features")
    if (marketId && productId) {
        edgesToInsert.push({ roadmap_id: roadmap.id, from_node_id: marketId, to_node_id: productId, type: "precedes" });
    }
    // Connect: Product -> GTM ("Product enables Sales")
    if (productId && gtmId) {
        edgesToInsert.push({ roadmap_id: roadmap.id, from_node_id: productId, to_node_id: gtmId, type: "precedes" });
    }

    if (edgesToInsert.length > 0) {
        await supabase.from("roadmap_edges").insert(edgesToInsert);
    }

    // Update title if HQ has a better name (optional, keeping simple for now)

    // 4. Return ID for client to redirect
    return { id: roadmap.id };
}
