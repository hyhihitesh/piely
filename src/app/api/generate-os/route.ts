
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Define the Zod schema for our Generative UI Blocks
// This must match the interfaces in src/lib/os-blocks.ts
const BlockSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("metric"),
        id: z.string(),
        title: z.string().optional(),
        colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(1),
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        trend: z
            .object({
                value: z.number(),
                direction: z.enum(["up", "down", "neutral"]),
                label: z.string().optional(),
            })
            .optional(),
        details: z.string().optional(),
        variant: z.enum(["default", "highlight", "danger", "success"]).optional(),
    }),
    z.object({
        type: z.literal("chart"),
        id: z.string(),
        title: z.string().optional(),
        colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
        chartType: z.enum(["bar", "line", "area", "pie"]),
        dataKey: z.string().describe("Key for the X-axis data"),
        series: z.array(
            z.object({
                key: z.string(),
                label: z.string(),
                color: z.string().optional(),
            })
        ),
        data: z.array(z.record(z.string(), z.any())).describe("Array of data points"),
        height: z.number().optional(),
    }),
    z.object({
        type: z.literal("table"),
        id: z.string(),
        title: z.string().optional(),
        colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(4),
        columns: z.array(
            z.object({
                key: z.string(),
                label: z.string(),
                format: z.enum(["currency", "percent", "number", "text"]).optional(),
            })
        ),
        data: z.array(z.record(z.string(), z.any())),
    }),
    z.object({
        type: z.literal("markdown"),
        id: z.string(),
        title: z.string().optional(),
        colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(4),
        content: z.string(),
    }),
]);

const GenerateOSSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    layout: z.array(BlockSchema),
});

export const maxDuration = 60; // Allow 60 seconds for generation

export async function POST(req: Request) {
    try {
        const { idea, module } = await req.json();

        if (!idea || !module) {
            return new Response("Missing idea or module", { status: 400 });
        }

        let systemPrompt = "";

        switch (module) {
            case "financial":
                systemPrompt = `You are an Expert Startup Financial Modeler.
        Your goal is to generate a 3-Year Financial Model for the user's startup idea.
        
        Use the "Geneartive UI" blocks to visualize the data:
        1. **Metrics**: Show key figures like Year 1 ARR, Monthly Burn, CAC, LTV.
        2. **Charts**: 
           - Create a "Revenue Growth" Area chart (Year 1-3).
           - Create a "Burn Rate" Bar chart.
        3. **Tables**: Create a "Cost Structure" breakdown table.
        4. **Markdown**: Brief explicit assumptions.
        
        Be realistic. If the idea is early, use conservative growth.`;
                break;

            case "market":
                systemPrompt = `You are an Expert Business Analyst.
        Your goal is to generate a TAM/SAM/SOM Market Analysis.
        
        Use the "Generative UI" blocks:
        1. **Markdown**: Explain the "Why Now" and "Problem/Solution".
        2. **Metrics**: Display the TAM, SAM, and SOM values in distinct cards.
        3. **Pie Chart**: Market Segmentation.
        4. **Table**: Competitor Analysis (Grid of 3-4 competitors).
        
        Use the Bottom-Up approach for sizing where possible.`;
                break;

            case "pitch":
                systemPrompt = `You are a Senior Venture Capitalist and Pitch Deck Architect.
        Your goal is to build a winning Pitch Deck skeleton.
        
        Use the "Generative UI" blocks:
        1. **Metrics**: Highlight Traction (Users/Revenue) if any, or key Projections. Include the "Ask" (Funding Amount).
        2. **Markdown**: Create a slide-by-slide outline (Hook, Problem, Solution, Team).
        3. **Chart**: "Traction vs. Time" or "Projected Growth" line chart.
        4. **Table**: Competitive Landscape (Grid comparing features against incumbents).`;
                break;

            case "gtm":
                systemPrompt = `You are a Growth Hacker and Go-To-Market Strategist.
        Your goal is to create a Launch & Growth Plan.
        
        Use the "Generative UI" blocks:
        1. **Metrics**: Set clear Goals (e.g., "1st 100 Users", "Year 1 MRR Goal").
        2. **Table**: Channel Strategy (Channel | Cost | Expected Impact | Priority).
        3. **Markdown**: A 4-Week Launch Timeline (Pre-launch, Launch Day, Post-launch).
        4. **Chart**: "User Acquisition Funnel" Bar chart (Awareness -> Conversion).`;
                break;

            default:
                systemPrompt = "You are a helpful startup assistant. Generate a relevant dashboard.";
        }

        const result = await generateObject({
            model: openai("gpt-4o"), // Use a strong model for complex schema generation
            schema: GenerateOSSchema,
            system: systemPrompt,
            prompt: `Startup Idea: "${idea}"\n\nGenerate the "${module}" OS module.`,
        });

        return Response.json(result.object);

    } catch (error) {
        console.error("OS Generation Error:", error);
        return new Response("Failed to generate OS module", { status: 500 });
    }
}
