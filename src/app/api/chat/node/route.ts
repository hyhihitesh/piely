import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    const { messages, nodeId, nodeTitle, nodeDescription, projectId } = await req.json();

    const supabase = await createClient();
    const lastUserMessage = messages[messages.length - 1];

    if (lastUserMessage) {
        await supabase.from("node_chat_messages").insert({
            node_id: nodeId,
            role: "user",
            content: lastUserMessage.content,
        });
    }

    // Format messages for AI SDK
    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content
    }));

    const result = await streamText({
        model: openai("gpt-4o"),
        system: `You are an expert consultant explaining the "${nodeTitle}" step of a startup roadmap.
    
    Context:
    - Node Description: "${nodeDescription}"
    - Project ID: ${projectId}
    
    Your Goal:
    - Answer specific questions about this step.
    - Provide actionable advice on how to execute this step.
    - Be concise.
    `,
        messages: formattedMessages,
        onFinish: async ({ text }) => {
            await supabase.from("node_chat_messages").insert({
                node_id: nodeId,
                role: "assistant",
                content: text,
            });
        }
    });

    // Use standard stream response compatible with installed SDK
    return result.toTextStreamResponse();
}
