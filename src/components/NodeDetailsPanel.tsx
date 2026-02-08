"use client";

import type { RoadmapStage, RoadmapItem, RoadmapResponse } from "@/lib/roadmapTypes";

interface NodeDetailsPanelProps {
  selectedNode: RoadmapStage | RoadmapItem | null;
  roadmap: RoadmapResponse | null;
  onStatusChange?: (nodeId: string, status: "pending" | "in_progress" | "completed") => void;
}

export function NodeDetailsPanel({
  selectedNode,
  roadmap,
  onStatusChange,
}: NodeDetailsPanelProps) {
  if (!selectedNode || !roadmap) {
    return (
      <div className="h-full w-full rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Click a node to see details
        </div>
      </div>
    );
  }

  const isStage = "stageOrder" in selectedNode;
  const node = selectedNode as RoadmapStage | RoadmapItem;

  // Find related items if this is a stage
  const relatedItems =
    isStage && roadmap
      ? roadmap.items.filter((item) => item.stageId === node.id)
      : [];

  // Find dependencies if this is an item
  const dependencies =
    !isStage && roadmap && "dependencies" in node
      ? roadmap.items.filter((item) =>
        (node as RoadmapItem).dependencies.includes(item.id),
      )
      : [];

  // Find items that depend on this one
  const dependents =
    !isStage && roadmap
      ? roadmap.items.filter((item) =>
        item.dependencies.includes(node.id),
      )
      : [];

  // Get category color
  const categoryColors: Record<string, string> = {
    product: "bg-blue-500/20 text-blue-300",
    gtm: "bg-green-500/20 text-green-300",
    hiring: "bg-purple-500/20 text-purple-300",
    funding: "bg-yellow-500/20 text-yellow-300",
    operations: "bg-orange-500/20 text-orange-300",
  };

  const difficultyColors: Record<string, string> = {
    low: "bg-green-500/20 text-green-300",
    medium: "bg-yellow-500/20 text-yellow-300",
    high: "bg-red-500/20 text-red-300",
  };

  const impactColors: Record<string, string> = {
    low: "bg-zinc-500/20 text-zinc-300",
    medium: "bg-blue-500/20 text-blue-300",
    high: "bg-purple-500/20 text-purple-300",
  };

  return (
    <div className="h-full w-full overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              {isStage ? (node as RoadmapStage).name : (node as RoadmapItem).title}
            </h3>
            {!isStage && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[(node as RoadmapItem).category] ||
                  "bg-zinc-500/20 text-zinc-300"
                  }`}
              >
                {(node as RoadmapItem).category.toUpperCase()}
              </span>
            )}
          </div>
          {isStage && (node as RoadmapStage).timeline && (
            <p className="text-xs text-zinc-400">
              Timeline: {(node as RoadmapStage).timeline}
            </p>
          )}
        </div>

        <div>
          <h4 className="mb-1 text-sm font-medium text-zinc-200">
            Description
          </h4>
          <p className="text-sm text-zinc-300">{node.description}</p>
        </div>

        {!isStage && (
          <>
            <div className="flex gap-3">
              <div>
                <span className="text-xs text-zinc-400">Difficulty</span>
                <div
                  className={`mt-1 rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[(node as RoadmapItem).difficulty] ||
                    "bg-zinc-500/20 text-zinc-300"
                    }`}
                >
                  {(node as RoadmapItem).difficulty.toUpperCase()}
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-400">Impact</span>
                <div
                  className={`mt-1 rounded-full px-2 py-1 text-xs font-medium ${impactColors[(node as RoadmapItem).impact] ||
                    "bg-zinc-500/20 text-zinc-300"
                    }`}
                >
                  {(node as RoadmapItem).impact.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-2">Status</span>
              <div className="flex gap-2">
                {(["pending", "in_progress", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange?.(node.id, s)}
                    className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${(node as RoadmapItem).status === s
                        ? s === 'completed'
                          ? "bg-green-500 text-black border border-green-600"
                          : s === 'in_progress'
                            ? "bg-blue-500 text-white border border-blue-600"
                            : "bg-zinc-600 text-white border border-zinc-500"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-800"
                      }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {dependencies.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-200">
              Depends On
            </h4>
            <ul className="space-y-1">
              {dependencies.map((dep) => (
                <li
                  key={dep.id}
                  className="rounded bg-zinc-800/50 px-2 py-1 text-xs text-zinc-300"
                >
                  {dep.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {dependents.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-200">
              Required For
            </h4>
            <ul className="space-y-1">
              {dependents.map((dep) => (
                <li
                  key={dep.id}
                  className="rounded bg-zinc-800/50 px-2 py-1 text-xs text-zinc-300"
                >
                  {dep.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isStage && relatedItems.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-zinc-200">
              Tasks & Milestones ({relatedItems.length})
            </h4>
            <ul className="space-y-2">
              {relatedItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-100">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[item.category] ||
                          "bg-zinc-500/20 text-zinc-300"
                          }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
