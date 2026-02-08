"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Node,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Layout } from "lucide-react"; // Icon for toggle

import { NodeDrawer } from "@/components/canvas/NodeDrawer";
import type { RoadmapResponse, RoadmapStage, RoadmapItem, RoadmapNodeData, NodeStatus } from "@/lib/roadmapTypes";
import { calculateLayout, applyLayoutHints } from "@/lib/layoutEngine";
import { TechnicalNode } from "@/components/canvas/TechnicalNode";
import { GhostNode } from "@/components/canvas/GhostNode";
import { AcceleratorTrack } from "@/components/canvas/AcceleratorTrack";
import { OSNode } from "@/components/canvas/OSNode";
import type { StartupStage } from "@/lib/stages";

import { ChatInterface } from "@/components/ChatInterface";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";

interface RoadmapCanvasProps {
  initialRoadmap: RoadmapResponse | null;
  projectId: string;
  projectIdea?: string;
  initialMessages?: unknown[];
  currentStage?: StartupStage;
  onSelectStage?: (stageId: string) => void;
  onSelectNode?: (node: RoadmapStage | RoadmapItem | null) => void;
  selectedCategories?: Set<string>;
  searchQuery?: string;
  completedItems?: Set<string>;
  onToggleComplete?: (itemId: string) => void;
}

const nodeTypes = {
  technical: TechnicalNode,
  ghost: GhostNode,
  os_module: OSNode,
  default: TechnicalNode,
};

const EMPTY_SET = new Set<string>();
const EMPTY_ARRAY: unknown[] = [];

function RoadmapCanvasInner({
  // ... props
  initialRoadmap,
  projectId,
  projectIdea = "Startup Idea",
  initialMessages = EMPTY_ARRAY,
  currentStage = "validation",
  onSelectStage,
  onSelectNode,
  selectedCategories = EMPTY_SET,
  searchQuery = "",
  completedItems = EMPTY_SET,
  onToggleComplete,
}: RoadmapCanvasProps) {
  // State for View Mode
  const [viewMode, setViewMode] = React.useState<"campus" | "blueprint">("campus");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<RoadmapItem | RoadmapStage | null>(null);

  const filteredItems = useMemo(() => {
    if (!initialRoadmap) return [];
    return initialRoadmap.items.filter((item) => {
      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(item.category)) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [initialRoadmap, selectedCategories, searchQuery]);

  // Stage order for comparison
  const STAGE_ORDER: Record<string, number> = {
    validation: 1,
    build: 2,
    growth: 3,
  };
  const currentStageOrder = STAGE_ORDER[currentStage] || 1;

  // Helper to determine node status based on stage comparison
  const getNodeStatus = (nodeStageId: string, isCompleted: boolean): NodeStatus => {
    const nodeStageOrder = STAGE_ORDER[nodeStageId] || 1;

    if (isCompleted) return "completed";
    if (nodeStageOrder < currentStageOrder) return "completed"; // Past stages
    if (nodeStageOrder === currentStageOrder) return "active";  // Current stage
    return "projected"; // Future stages
  };

  const initialNodes = useMemo(() => {
    if (!initialRoadmap) return [];

    // Calculate layout positions: "tree" for Blueprint, default/existing for Campus
    const activeLayout = viewMode === "blueprint" ? "tree" : (initialRoadmap.layoutType || "swimlanes");
    const basePositions = calculateLayout(initialRoadmap, activeLayout);

    // Only apply hints (manual overrides) if we are in Campus mode. 
    // Blueprint mode enforces strict structure.
    const positions = viewMode === "campus"
      ? applyLayoutHints(basePositions, initialRoadmap)
      : basePositions;

    return [
      // stage nodes
      ...initialRoadmap.stages.map((stage) => {
        const pos = positions.get(stage.id) || { x: 0, y: 0 };
        const stageStatus = getNodeStatus(stage.id, false);
        return {
          id: stage.id,
          data: {
            label: stage.name,
            stageId: stage.id,
            type: "stage",
            stageData: stage,
            nodeStatus: stageStatus, // AI-driven status
          },
          position: {
            x: pos.x,
            y: pos.y,
          },
          type: "technical",
        };
      }),
      // item nodes (filtered)
      ...filteredItems.map((item) => {
        // Prioritize persisted metadata coordinates (Visual OS) layout over auto-layout
        const meta = item.metadata as Record<string, unknown>;
        let pos = positions.get(item.id) || { x: 0, y: 0 };

        // Only use persisted coordinates in Campus Mode
        if (viewMode === "campus" && meta?.x !== undefined && meta?.y !== undefined) {
          pos = { x: meta.x as number, y: meta.y as number };
        }

        const isCompleted = completedItems.has(item.id) || item.status === "completed";
        const itemStatus = getNodeStatus(item.stageId, isCompleted);
        return {
          id: item.id,
          data: {
            label: item.title,
            stageId: item.stageId,
            type: "item",
            itemData: item,
            isCompleted,
            nodeStatus: itemStatus, // AI-driven status
          },
          position: { x: pos.x, y: pos.y },
          type: ((item.metadata as Record<string, unknown> | null)?.type === "os_module" ? "os_module" : "technical") as "os_module" | "technical",
        };
      }),
      // Ghost Node (if AI is active)
    ] as Node<RoadmapNodeData>[];
  }, [initialRoadmap, filteredItems, completedItems, currentStage, viewMode]);

  const initialEdges = useMemo(() => {
    if (!initialRoadmap || !initialRoadmap.edges) return [];

    return initialRoadmap.edges.map((edge) => {
      // Edge styling based on type
      const edgeStyles = {
        depends_on: { stroke: "#f97316", strokeWidth: 2, animated: true },
        precedes: { stroke: "url(#accelerator-gradient)", strokeWidth: 2, animated: false },
        related: { stroke: "#94a3b8", strokeWidth: 1, animated: false },
      };
      const style = edgeStyles[edge.type] || edgeStyles.related;

      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        animated: style.animated,
        type: "smoothstep",
        style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
      };
    });
  }, [initialRoadmap]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when ViewMode changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Realtime subscription for live canvas updates
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roadmap_nodes',
          filter: `roadmap_id=eq.${projectId}`,
        },
        (payload) => {
          const newRow = payload.new as Database["public"]["Tables"]["roadmap_nodes"]["Row"];
          const metadata = newRow.metadata as Record<string, any> | null;

          // Create ReactFlow node from database row
          const newNode: Node<RoadmapNodeData> = {
            id: newRow.id,
            type: metadata?.type === "os_module" ? "os_module" : "technical",
            position: {
              x: (metadata?.x as number) ?? 400,
              y: (metadata?.y as number) ?? 200,
            },
            data: {
              label: newRow.title,
              stageId: metadata?.stageId || 'validation',
              type: 'item',
              itemData: {
                id: newRow.id,
                title: newRow.title,
                description: newRow.description || '',
                stageId: metadata?.stageId || 'validation',
                category: metadata?.category || 'product',
                difficulty: 'medium',
                impact: 'high',
                dependencies: [],
                status: newRow.status as RoadmapItem["status"],
              },
              nodeStatus: 'active',
            },
          };

          setNodes((nds) => [...nds, newNode]);
        }
      )
      .subscribe();

    // Separate channel for Edges (or could be same channel, different listener)
    const edgeChannel = supabase
      .channel(`project-edges-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roadmap_edges',
          filter: `roadmap_id=eq.${projectId}`,
        },
        (payload) => {
          const newEdgeRow = payload.new as Database["public"]["Tables"]["roadmap_edges"]["Row"];

          if (!newEdgeRow.from_node_id || !newEdgeRow.to_node_id) return;

          const edgeStyles = {
            depends_on: { stroke: "#f97316", strokeWidth: 2, animated: true },
            precedes: { stroke: "url(#accelerator-gradient)", strokeWidth: 2, animated: false },
            related: { stroke: "#94a3b8", strokeWidth: 1, animated: false },
          };
          const edgeType = (newEdgeRow.type as keyof typeof edgeStyles) || "related";
          const style = edgeStyles[edgeType] || edgeStyles.related;

          const newEdge = {
            id: newEdgeRow.id,
            source: newEdgeRow.from_node_id,
            target: newEdgeRow.to_node_id,
            animated: style.animated,
            type: "smoothstep",
            style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
          };

          setEdges((eds) => [...eds, newEdge]);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(edgeChannel);
    };
  }, [projectId, setNodes]);

  function handleNodeClick(e: React.MouseEvent, node: Node) {
    if (!initialRoadmap) return;

    const nodeData = node.data;
    if (nodeData?.type === "stage") {
      const stage = initialRoadmap.stages.find((s) => s.id === nodeData.stageId);
      if (stage) {
        setSelectedNode(stage); // Open Drawer
        onSelectNode?.(stage);
        if (onSelectStage) {
          onSelectStage(stage.id);
        }
      }
    } else if (nodeData?.type === "item") {
      const item = initialRoadmap.items.find((i) => i.id === node.id);
      if (item) {
        // Double-click to toggle completion
        if (e.detail === 2 && onToggleComplete) {
          onToggleComplete(item.id);
        } else {
          setSelectedNode(item); // Open Drawer
          onSelectNode?.(item);
        }
      }
    }
  }

  return (
    <div className={`h-full w-full relative transition-colors duration-500 ${viewMode === "blueprint"
      ? "theme-blueprint bg-[#101420]"
      : "bg-gray-50 dark:bg-[#111]"
      }`}>
      {/* Accelerator Progress Track */}
      <AcceleratorTrack currentStage={currentStage} />

      {/* Shared Definitions for Edge Gradients */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <linearGradient id="accelerator-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />  {/* Amber (HQ) */}
            <stop offset="50%" stopColor="#8b5cf6" />  {/* Violet (Product) */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald (GTM) */}
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={() => onSelectNode?.(null)}
        fitView
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Background
          variant={viewMode === "blueprint" ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={viewMode === "blueprint" ? 40 : 24}
          size={1}
          color={viewMode === "blueprint" ? "rgba(255,255,255,0.05)" : "#a1a1aa"}
          className={viewMode === "blueprint" ? "" : "opacity-20"}
        />
        <MiniMap
          nodeColor={viewMode === "blueprint" ? "#1a1f35" : "#e4e4e7"}
          maskColor={viewMode === "blueprint" ? "rgba(0,0,0,0.5)" : "rgba(20, 20, 20, 0.05)"}
          className="!bg-background !border !border-border rounded-sm"
        />
        <Controls className="bg-background border border-border rounded-sm shadow-sm" />

        {/* View Switcher Panel */}
        <Panel position="top-right" className="flex gap-2 items-center">
          {/* AI Consultant Button */}
          <div className="bg-background/90 backdrop-blur border border-border p-1 rounded-lg shadow-sm">
            <button
              onClick={async () => {
                setIsAnalyzing(true);
                try {
                  const { analyzeCanvas } = await import("@/actions/analyze-canvas");
                  await analyzeCanvas(projectId);
                } catch (err) {
                  console.error("AI Analysis failed", err);
                } finally {
                  setIsAnalyzing(false);
                }
              }}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isAnalyzing
                ? "bg-amber-100 text-amber-700 animate-pulse cursor-wait"
                : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                }`}
            >
              {isAnalyzing ? "🧠 Thinking..." : "✨ Consult AI"}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="bg-background/90 backdrop-blur border border-border p-1 rounded-lg flex gap-1 shadow-sm">
            <button
              onClick={() => setViewMode("campus")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "campus"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted"
                }`}
            >
              🏙️ Campus
            </button>
            <button
              onClick={() => setViewMode("blueprint")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "blueprint"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted"
                }`}
            >
              📐 Blueprint
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {initialRoadmap && (
        <ChatInterface
          idea={projectIdea}
          roadmap={initialRoadmap}
          projectId={projectId}
          currentStage={currentStage}
          initialMessages={initialMessages}
        />
      )}

      {/* Node Context Drawer */}
      <NodeDrawer
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        selectedNode={selectedNode}
        projectId={projectId}
      />
    </div>
  );
}

export function RoadmapCanvas(props: RoadmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
