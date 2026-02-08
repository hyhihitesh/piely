import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, generateObject } from "ai";
import { ONBOARDING_SYSTEM_PROMPT } from "@/lib/stages";
import { z } from "zod";

export const maxDuration = 30;

// Schema for AI-generated canvas nodes
const CanvasNodeSchema = z.object({
  shouldCreateNode: z.boolean().describe("True if user request warrants creating a new canvas node"),
  node: z.object({
    title: z.string().max(50).describe("Concise, action-oriented title (2-4 words)"),
    description: z.string().max(200).describe("Brief explanation of this module"),
    type: z.enum(["product", "gtm", "hiring", "funding", "operations"]).describe("Category: product=features, gtm=marketing/sales, hiring=team, funding=finance, operations=business ops"),
  }).nullable().describe("Node data if shouldCreateNode is true, null otherwise"),
  confirmation: z.string().max(100).describe("Brief confirmation message to show in chat"),
});

export async function POST(req: Request) {
  const { messages, mode, context } = await req.json();

  // Mode 3: Canvas Node Generation (THE USP)
  if (mode === "canvas") {
    try {
      const result = await generateObject({
        model: openai("gpt-4o"),
        schema: CanvasNodeSchema,
        system: `You are Piely, a Startup Architect that builds visual roadmaps.
      
CONTEXT:
- Startup Idea: ${context?.idea || "Not specified"}
- Current Stage: ${context?.stage || "validation"}

TASK:
When the user asks to add a feature, module, milestone, or task, you should:
1. Set shouldCreateNode to true
2. Generate a concise node title (2-4 words, action-oriented)
3. Write a brief description explaining why this module matters
4. Pick the appropriate type:
   - product = core features, user-facing functionality
   - gtm = go-to-market, marketing, sales
   - hiring = team building, recruitment
   - funding = fundraising, financial planning
   - operations = business operations, internal processes
5. Write a short confirmation message

If the user is just asking a question (not requesting a new module), set shouldCreateNode to false and provide a helpful confirmation/answer.

Examples of node-worthy requests:
- "Add user authentication" → Node: "User Auth System" (product)
- "I need a pricing page" → Node: "Pricing Page" (gtm)
- "Build payment flow" → Node: "Payment Integration" (product)
- "Hire a designer" → Node: "Design Lead" (hiring)`,
        prompt: messages?.[0]?.content || "Add a new feature",
      });

      return Response.json(result.object);
    } catch (error) {
      console.error("Canvas mode error:", error);
      return Response.json(
        { error: "Failed to generate node", shouldCreateNode: false, confirmation: "Sorry, I encountered an error." },
        { status: 500 }
      );
    }
  }

  // Mode 1: Onboarding Interviewer
  let systemPrompt = `You are Piely, an intelligent startup architect.`;

  if (mode === "onboarding") {
    systemPrompt = ONBOARDING_SYSTEM_PROMPT.replace("{{USER_IDEA}}", context?.idea || "Unknown Idea");
  } else {
    // Mode 2: The Co-Founder (Standard Chat)
    systemPrompt = `You are a Senior Logic Analyst and Startup Co-founder.
    
    CONTEXT:
    - Idea: ${context?.idea || "Not specified"}
    
    CAPABILITIES:
    - Suggest generating specific modules using JSON:
      - Financials: { "suggestedAction": "generate_financial_os" }
      - Market: { "suggestedAction": "generate_market_os" }
      - Pitch: { "suggestedAction": "generate_pitch_os" }
      - GTM: { "suggestedAction": "generate_gtm_os" }
    
    Keep responses concise, technical, and actionable.`;
  }

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
