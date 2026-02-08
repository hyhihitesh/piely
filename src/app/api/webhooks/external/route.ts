import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.json();
    const headersList = await headers();

    // 1. Verify Secret
    const secretKey = headersList.get("x-webhook-secret");

    if (!secretKey) {
        return new Response("Missing Secret", { status: 401 });
    }

    const supabase = await createClient();

    // 2. Find matching webhook configuration
    const { data: webhook } = await supabase
        .from("node_webhooks")
        .select("id, node_id, is_active")
        .eq("secret_key", secretKey)
        .single();

    if (!webhook || !webhook.is_active) {
        return new Response("Invalid or Inactive Webhook", { status: 403 });
    }

    // 3. Process Event (Mock Logic)
    // In a real app, we would switch(provider) and validate the payload signature

    // Update Node Status to 'completed'
    await supabase
        .from("roadmap_nodes")
        .update({ status: "completed" })
        .eq("id", webhook.node_id);

    // Log to Chat History
    await supabase.from("node_chat_messages").insert({
        node_id: webhook.node_id,
        role: "assistant", // Using assistant for system notifications
        content: `⚡ **Webhook Event:** Received payload. Node marked as completed.`,
    });

    // Update Last Triggered
    await supabase
        .from("node_webhooks")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", webhook.id);

    return new Response("Webhook Processed", { status: 200 });
}
