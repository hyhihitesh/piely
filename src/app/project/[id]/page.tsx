import { createClient } from "@/utils/supabase/server";
import { RoadmapCanvas } from "@/components/RoadmapCanvas";
import { STAGES, StartupStage } from "@/lib/stages";
import type { RoadmapResponse, RoadmapItem, RoadmapStage, RoadmapEdge } from "@/lib/roadmapTypes";
import { redirect } from "next/navigation";
import { Database } from "@/lib/database.types";
import { AppHeader } from "@/components/layout/AppHeader";

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
    const supabase = await createClient<Database>();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth");
    }

    // 1. Fetch Project Data
    const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", id)
        .single();

    if (roadmapError || !roadmap) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                    <p className="text-muted-foreground">The blueprint you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    // 2. Fetch Nodes & Edges
    const { data: nodes } = await supabase
        .from("roadmap_nodes")
        .select("*")
        .eq("roadmap_id", id)
        .order("order_index", { ascending: true });

    const { data: edges } = await supabase
        .from("roadmap_edges")
        .select("*")
        .eq("roadmap_id", id);

    // 3. Transform to RoadmapResponse
    const stages: RoadmapStage[] = [
        { ...STAGES.validation, stageOrder: 1, name: STAGES.validation.label },
        { ...STAGES.build, stageOrder: 2, name: STAGES.build.label },
        { ...STAGES.growth, stageOrder: 3, name: STAGES.growth.label },
    ];

    const items: RoadmapItem[] = (nodes || []).map((node) => {
        const metadata = node.metadata as Record<string, any> | null;
        return {
            id: node.id,
            title: node.title,
            description: node.description || "",
            // Fallback to validation if stageId is missing (legacy nodes)
            stageId: metadata?.stageId || "validation",
            category: "product",
            difficulty: "medium",
            impact: "high",
            dependencies: [],
            status: node.status as RoadmapItem["status"],
            metadata: metadata as RoadmapItem["metadata"],
        };
    });

    const roadmapData: RoadmapResponse = {
        stages,
        items,
        edges: (edges || []).map((e): RoadmapEdge => ({
            id: e.id,
            from: e.from_node_id || "",
            to: e.to_node_id || "",
            type: e.type as RoadmapEdge["type"],
        })),
    };


    const coreNode = nodes?.find(n => n.order_index === 0);
    const initialMessages = (coreNode?.metadata as Record<string, any> | null)?.messages || [];



    // ... existing code ...

    return (
        <div className="h-screen w-screen overflow-hidden bg-background relative">
            <AppHeader
                user={user}
                variant="overlay"
                className="absolute top-0 left-0 w-full"
                breadcrumb={{
                    title: roadmap.title || "Untitled Project"
                }}
            />
            <RoadmapCanvas
                initialRoadmap={roadmapData}
                projectId={id}
                projectIdea={roadmap.idea_description || roadmap.title}
                initialMessages={initialMessages}
                currentStage={(roadmap.stage as StartupStage) || "validation"}
            />
        </div>
    );
}

