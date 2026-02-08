"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { OSModuleSchema, OSBlockSchema } from "@/lib/schemas/os-modules";
import { z } from "zod";

export interface StartupOSResult {
    hq: z.infer<typeof OSModuleSchema>;
    market: z.infer<typeof OSModuleSchema>;
    product: z.infer<typeof OSModuleSchema>;
    gtm: z.infer<typeof OSModuleSchema>;
}

// Helper to generate a single module
async function generateModule(
    idea: string,
    moduleType: "hq" | "market" | "product" | "gtm",
    description: string
) {
    try {
        const { object } = await generateObject({
            model: openai("gpt-4o"), // Use 4o for complex structure
            schema: OSModuleSchema,
            prompt: `
        You are an expert YC Startup Advisor and Product Manager.
        The user has a startup idea: "${idea}".
        
        Generate a detailed visual "${moduleType.toUpperCase()}" module for their Startup Dashboard.
        Context: ${description}
        
        Requirements:
        1. Create a rich layout with 3-5 blocks (Metrics, Charts, Tables, Markdown).
        2. Content must be specific to the idea, not generic.
        3. For Charts: Use "bar", "line", or "pie".
        4. For Metrics: Include realistic projections or standard benchmarks.
        5. For Tables: Compare competitors or list features.
        6. IMPORTANT: The "data" field must be a STRINGIFIED JSON array (e.g. "[{...}]"), not a raw array.
        
        Output valid JSON matching the schema.
      `,
        });

        // Parse the data fields back into objects
        const parsedLayout = object.layout.map(block => {
            if (block.data && typeof block.data === 'string') {
                try {
                    return { ...block, data: JSON.parse(block.data) };
                } catch (e) {
                    console.error("Failed to parse block data JSON:", e);
                    return { ...block, data: [] };
                }
            }
            return block;
        });

        return { ...object, layout: parsedLayout };
    } catch (error) {
        console.error(`Error generating ${moduleType}:`, error);
        // Return a fallback error module
        return {
            title: `${moduleType.toUpperCase()} Error`,
            description: "Failed to generate content.",
            layout: [{ type: "markdown" as const, content: "Failed to generate content." }],
        } as z.infer<typeof OSModuleSchema>;
    }
}

export async function generateStartupOS(idea: string): Promise<StartupOSResult> {

    // Parallel Execution
    const [hq, market, product, gtm] = await Promise.all([
        generateModule(
            idea,
            "hq",
            "Headquarters: Mission Statement, Vision, Founding Team Roles needed, and North Star Metric."
        ),
        generateModule(
            idea,
            "market",
            "Market Intelligence: TAM/SAM/SOM breakdown, Competitor Analysis Table, and Market Trends Chart."
        ),
        generateModule(
            idea,
            "product",
            "Product Engine: MVP Feature List (Table), Development Timeline (Chart), and Tech Stack recommendation."
        ),
        generateModule(
            idea,
            "gtm",
            "Go-To-Market Command: Pitch Deck Outline (Markdown), Sales Funnel projection (Chart), and Marketing Channels."
        ),
    ]);

    return { hq, market, product, gtm };
}
