import { OSModuleData } from "./os-blocks";

export type RoadmapStageId = string; // Dynamic - AI can create custom stages

export type RoadmapDetailLevel = "high_level" | "detailed";

export type LayoutType =
  | "timeline"
  | "tree"
  | "swimlanes"
  | "radial"
  | "flow"
  | "custom";

export interface RoadmapStage {
  id: RoadmapStageId;
  name: string;
  stageOrder: number;
  description: string;
  timeline?: string;
}

export type RoadmapItemCategory =
  | "product"
  | "gtm"
  | "hiring"
  | "funding"
  | "operations";

export interface RoadmapItem {
  id: string;
  title: string;
  stageId: RoadmapStageId;
  category: RoadmapItemCategory;
  description: string;
  difficulty: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  dependencies: string[];
  status?: "pending" | "in_progress" | "completed";
  metadata?:
  | {
    type: "os_module";
    moduleType: "financial" | "market" | "pitch" | "gtm";
    data: OSModuleData;
  }
  | Record<string, unknown>;
}

export interface RoadmapEdge {
  id: string;
  from: string;
  to: string;
  type: "depends_on" | "precedes" | "related";
}

export interface RoadmapResponse {
  stages: RoadmapStage[];
  items: RoadmapItem[];
  edges?: RoadmapEdge[];
  layoutType?: LayoutType;
  layoutHints?: {
    [nodeId: string]: {
      lane?: number;
      level?: number;
      suggestedX?: number;
      suggestedY?: number;
    };
  };
}

// Accelerator node visual states
export type NodeStatus = "active" | "completed" | "projected" | "locked";

export interface RoadmapNodeData {
  label: string;
  stageId: string;
  type: "stage" | "item";
  stageData?: RoadmapStage;
  itemData?: RoadmapItem;
  isCompleted?: boolean;
  nodeStatus?: NodeStatus; // Accelerator visual state
}
