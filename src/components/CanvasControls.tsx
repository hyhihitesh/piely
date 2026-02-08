"use client";

import type { RoadmapItemCategory } from "@/lib/roadmapTypes";

interface CanvasControlsProps {
  selectedCategories: Set<RoadmapItemCategory>;
  onCategoryToggle: (category: RoadmapItemCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories: RoadmapItemCategory[] = [
  "product",
  "gtm",
  "hiring",
  "funding",
  "operations",
];

const categoryLabels: Record<RoadmapItemCategory, string> = {
  product: "Product",
  gtm: "GTM",
  hiring: "Hiring",
  funding: "Funding",
  operations: "Ops",
};

export function CanvasControls({
  selectedCategories,
  onCategoryToggle,
  searchQuery,
  onSearchChange,
}: CanvasControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-400">Filter:</label>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryToggle(category)}
            className={`rounded-full px-2 py-1 text-xs transition ${
              selectedCategories.has(category)
                ? "bg-zinc-100 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-center gap-2">
        <label className="text-xs font-medium text-zinc-400">Search:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search nodes..."
          className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
    </div>
  );
}
