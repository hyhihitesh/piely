import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { roadmapResponseSchema } from "@/lib/roadmapSchema";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea, currentRoadmap, variantType } = body;

    if (!idea || typeof idea !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'idea' field" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const variantPrompt =
      variantType === "faster"
        ? "Generate a faster, more aggressive roadmap with shorter timelines."
        : variantType === "safer"
          ? "Generate a more conservative, risk-averse roadmap with extra validation steps."
          : "Generate an alternative roadmap with different strategic approaches.";

    const { object: validated } = await generateObject({
      model: openai("gpt-4o-mini"),
      temperature: 0.8,
      schema: roadmapResponseSchema,
      system:
        "You are an experienced startup operator. Generate an alternative roadmap variant. " +
        "Stages should be ordered from earliest to latest using 'stageOrder'. " +
        "Choose a layoutType that best represents the roadmap structure visually (timeline, tree, swimlanes, radial, flow, custom).",
      prompt:
        `Startup idea: ${idea}\n` +
        `Current roadmap: ${currentRoadmap ? JSON.stringify(currentRoadmap, null, 2) : "None"}\n` +
        `Variant type: ${variantPrompt}`,
    });

    return NextResponse.json(validated);
  } catch (error) {
    console.error("generate-variants error", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap variant" },
      { status: 500 },
    );
  }
}

