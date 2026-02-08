import type {
  RoadmapResponse,
  RoadmapStage,
  RoadmapItem,
  LayoutType,
} from "@/lib/roadmapTypes";

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

import dagre from "dagre";

// ... (keep interface NodePosition)

export function calculateLayout(
  roadmap: RoadmapResponse,
  layoutTypeOverride?: LayoutType // Allow overriding the roadmap's default
): Map<string, NodePosition> {
  const layoutType = layoutTypeOverride || roadmap.layoutType || "swimlanes";
  const positions = new Map<string, NodePosition>();

  switch (layoutType) {
    case "timeline":
      return calculateTimelineLayout(roadmap);
    case "tree":
      return calculateTreeLayout(roadmap);
    case "swimlanes":
      return calculateSwimlanesLayout(roadmap);
    // ...
    default:
      return calculateSwimlanesLayout(roadmap);
  }
}

// ... (keep calculateTimelineLayout)

function calculateTimelineLayout(roadmap: RoadmapResponse): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const sortedStages = [...roadmap.stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const stageWidth = 350;
  const stageY = 100;
  const itemSpacing = 100;

  sortedStages.forEach((stage, stageIndex) => {
    const stageX = stageIndex * stageWidth;
    positions.set(stage.id, { id: stage.id, x: stageX, y: stageY });

    const stageItems = roadmap.items.filter((item) => item.stageId === stage.id);
    stageItems.forEach((item, itemIndex) => {
      const itemX = stageX;
      const itemY = stageY + 150 + itemIndex * itemSpacing;
      positions.set(item.id, { id: item.id, x: itemX, y: itemY });
    });
  });

  return positions;
}

function calculateTreeLayout(roadmap: RoadmapResponse): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const g = new dagre.graphlib.Graph();

  g.setGraph({
    rankdir: "TB", // Top-to-Bottom
    nodesep: 100,  // Horizontal spacing
    ranksep: 200,  // Vertical spacing
    align: "UL"    // Align upper-left 
  });
  g.setDefaultEdgeLabel(() => ({}));

  // 1. Add Nodes
  const sortedStages = [...roadmap.stages].sort((a, b) => a.stageOrder - b.stageOrder);

  sortedStages.forEach(stage => {
    g.setNode(stage.id, { width: 300, height: 100 });
  });
  roadmap.items.forEach(item => {
    // OSModules are wider, check metadata if available
    const meta = item.metadata as Record<string, unknown> | null;
    const layout = meta?.layout as unknown[] | undefined;
    const isWide = layout && layout.length > 4;
    g.setNode(item.id, { width: isWide ? 500 : 350, height: 150 });
  });

  // 2. Add Edges
  // If we have explicit edges, use them
  if (roadmap.edges && roadmap.edges.length > 0) {
    roadmap.edges.forEach(edge => {
      g.setEdge(edge.from, edge.to);
    });
  } else {
    // FALLBACK: If no edges exist, Create a Synthetic Hierarchy:
    // Stages -> Items in that stage
    sortedStages.forEach((stage, idx) => {
      // Connect stages sequentially
      if (idx > 0) {
        g.setEdge(sortedStages[idx - 1].id, stage.id);
      }

      // Connect stage to its items
      const stageItems = roadmap.items.filter(i => i.stageId === stage.id);
      stageItems.forEach(item => {
        g.setEdge(stage.id, item.id);
      });
    });
  }

  // 3. Compute Layout
  dagre.layout(g);

  // 4. Extract Positions
  g.nodes().forEach(nodeId => {
    const node = g.node(nodeId);
    // Dagre gives center coords, we might need top-left depending on ReactFlow anchor
    // ReactFlow default is top-left, but with handles it Centers? 
    // Usually ReactFlow 'position' is Top-Left. Dagre gives Center.
    // Let's adjust:
    positions.set(nodeId, {
      id: nodeId,
      x: node.x - (node.width / 2),
      y: node.y - (node.height / 2)
    });
  });

  return positions;
}

function calculateSwimlanesLayout(roadmap: RoadmapResponse): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const sortedStages = [...roadmap.stages].sort((a, b) => a.stageOrder - b.stageOrder);
  // Expanded spacing for "Accelerator Path" visual effect
  const laneWidth = 500;
  const stageGap = 100; // Extra gap between stages
  const laneHeight = 280;
  const itemSpacing = 130;

  sortedStages.forEach((stage, stageIndex) => {
    const stageX = stageIndex * (laneWidth + stageGap);
    positions.set(stage.id, { id: stage.id, x: stageX, y: 0 });

    const stageItems = roadmap.items.filter((item) => item.stageId === stage.id);
    stageItems.forEach((item, itemIndex) => {
      const itemX = stageX + 50; // Slight offset from stage node
      const itemY = laneHeight + (itemIndex % 4) * itemSpacing + Math.floor(itemIndex / 4) * 50;
      positions.set(item.id, { id: item.id, x: itemX, y: itemY });
    });
  });

  return positions;
}

function calculateRadialLayout(roadmap: RoadmapResponse): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const sortedStages = [...roadmap.stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const centerX = 500;
  const centerY = 400;
  const radius = 300;
  const angleStep = (2 * Math.PI) / sortedStages.length;

  sortedStages.forEach((stage, stageIndex) => {
    const angle = stageIndex * angleStep - Math.PI / 2;
    const stageX = centerX + radius * Math.cos(angle);
    const stageY = centerY + radius * Math.sin(angle);
    positions.set(stage.id, { id: stage.id, x: stageX, y: stageY });

    const stageItems = roadmap.items.filter((item) => item.stageId === stage.id);
    const itemRadius = radius * 0.6;
    const itemAngleStep = angleStep / Math.max(stageItems.length, 1);

    stageItems.forEach((item, itemIndex) => {
      const itemAngle = angle + (itemIndex - stageItems.length / 2) * itemAngleStep;
      const itemX = centerX + itemRadius * Math.cos(itemAngle);
      const itemY = centerY + itemRadius * Math.sin(itemAngle);
      positions.set(item.id, { id: item.id, x: itemX, y: itemY });
    });
  });

  return positions;
}

function calculateFlowLayout(roadmap: RoadmapResponse): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const sortedStages = [...roadmap.stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const stageSpacing = 300;
  const itemOffsetX = 150;
  const itemSpacingY = 80;

  sortedStages.forEach((stage, stageIndex) => {
    const stageX = stageIndex * stageSpacing;
    const stageY = 200;
    positions.set(stage.id, { id: stage.id, x: stageX, y: stageY });

    const stageItems = roadmap.items.filter((item) => item.stageId === stage.id);
    stageItems.forEach((item, itemIndex) => {
      const itemX = stageX + itemOffsetX;
      const itemY = stageY + (itemIndex - stageItems.length / 2) * itemSpacingY;
      positions.set(item.id, { id: item.id, x: itemX, y: itemY });
    });
  });

  return positions;
}

export function applyLayoutHints(
  positions: Map<string, NodePosition>,
  roadmap: RoadmapResponse,
): Map<string, NodePosition> {
  if (!roadmap.layoutHints) return positions;

  const updated = new Map(positions);

  Object.entries(roadmap.layoutHints).forEach(([nodeId, hints]) => {
    const current = updated.get(nodeId);
    if (!current) return;

    updated.set(nodeId, {
      id: nodeId,
      x: hints.suggestedX ?? current.x,
      y: hints.suggestedY ?? current.y,
    });
  });

  return updated;
}
