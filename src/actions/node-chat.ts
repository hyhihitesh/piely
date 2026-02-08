"use server";

import { createClient } from "@/utils/supabase/server";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    parts: Array<{ type: "text"; text: string }>;
}

export async function fetchNodeChatHistory(nodeId: string): Promise<ChatMessage[]> {
    const supabase = await createClient();

    const { data: messages, error } = await supabase
        .from("node_chat_messages")
        .select("*")
        .eq("node_id", nodeId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching chat history:", error);
        return [];
    }

    // Convert to AI SDK v4 message format with parts
    return messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
    }));
}
