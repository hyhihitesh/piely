import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  roadmapDetailLevelSchema,
  roadmapResponseSchema,
  roadmapStageIdSchema,
} from "@/lib/roadmapSchema";
import type { RoadmapDetailLevel, RoadmapStageId } from "@/lib/roadmapTypes";
import { researchStartupIdea } from "@/lib/research";

export const maxDuration = 60;

interface GenerateRoadmapRequestBody {
  idea: string;
  focusStage?: RoadmapStageId;
  detailLevel?: RoadmapDetailLevel;
  includeResearch?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<GenerateRoadmapRequestBody>;

    if (!body.idea || typeof body.idea !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'idea' field" },
        { status: 400 },
      );
    }

    const focusStage = body.focusStage
      ? roadmapStageIdSchema.parse(body.focusStage)
      : undefined;
    const detailLevel = body.detailLevel
      ? roadmapDetailLevelSchema.parse(body.detailLevel)
      : ("high_level" as RoadmapDetailLevel);

    const includeResearch = body.includeResearch ?? false;
    let researchInsights = null;

    if (includeResearch) {
      researchInsights = await researchStartupIdea(body.idea);
    }

    if (!process.env.OPENAI_API_KEY) {
      const stubRoadmap = buildStubRoadmap(body.idea, focusStage, detailLevel);
      return NextResponse.json(roadmapResponseSchema.parse(stubRoadmap));
    }

    const { object: roadmap } = await generateObject({
      model: openai("gpt-4o-mini"),
      temperature: 0.7,
      schema: roadmapResponseSchema,
      system:
        "You are an experienced startup operator and product strategist. " +
        "Given a startup idea, you design an execution roadmap from idea to IPO. " +
        "Be DIRECT and no-BS: 'Do X, then Y. Don't do Z because...' But also explain WHY in 1-2 sentences when relevant. " +
        "Stages should be ordered from earliest to latest using 'stageOrder'. " +
        "Create 5-10 big milestones per stage, and each milestone can branch into smaller actionable tasks. " +
        "Adapt stages to the specific startup idea - don't force standard stages if they don't fit. " +
        "Choose a layoutType that best represents the roadmap structure visually (timeline, tree, swimlanes, radial, flow, custom).",
      prompt:
        `Startup idea: ${body.idea}\n` +
        `Focus stage: ${focusStage ?? "all"}\n` +
        `Detail level: ${detailLevel ?? "high_level"}` +
        (researchInsights
          ? `\n\nResearch insights:\n` +
          (researchInsights.competitors
            ? `Competitors: ${researchInsights.competitors.join(", ")}\n`
            : "") +
          (researchInsights.marketTrends
            ? `Market trends: ${researchInsights.marketTrends.join("; ")}\n`
            : "")
          : ""),
    });

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("generate-roadmap error", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 },
    );
  }
}

function buildStubRoadmap(
  idea: string,
  focusStage?: RoadmapStageId,
  detailLevel?: RoadmapDetailLevel,
) {
  const stagesOrder: RoadmapStageId[] = [
    "idea",
    "validation",
    "build",
    "launch",
    "growth",
    "scale",
    "ipo",
  ];

  const activeStages = focusStage ? [focusStage] : stagesOrder;

  const stages = activeStages.map((stageId, index) => ({
    id: stageId,
    name: stageId.toUpperCase(),
    stageOrder: index,
    description: `High-level ${stageId} stage for "${idea}".`,
    timeline: undefined,
  }));

  const items = stages.flatMap((stage) => {
    const baseId = stage.id;
    return [
      {
        id: `${baseId}-1`,
        title: `${stage.name} milestone 1`,
        stageId: stage.id,
        category: "product" as const,
        description: `First key milestone in the ${stage.name} stage.`,
        difficulty: "medium" as const,
        impact: "high" as const,
        dependencies: [],
      },
      {
        id: `${baseId}-2`,
        title: `${stage.name} milestone 2`,
        stageId: stage.id,
        category: "gtm" as const,
        description: `Second key milestone in the ${stage.name} stage.`,
        difficulty: "medium" as const,
        impact: "medium" as const,
        dependencies: [`${baseId}-1`],
      },
    ];
  });

  const edges = items
    .filter((item) => item.dependencies.length > 0)
    .map((item) => ({
      id: `${item.id}-edge`,
      from: item.dependencies[0],
      to: item.id,
      type: "depends_on" as const,
    }));

  return { stages, items, edges };
}


