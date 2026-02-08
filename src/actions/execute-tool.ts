"use server";

import { createClient } from "@/utils/supabase/server";
import { env } from "@/lib/env";

export async function executeTool(toolId: string, nodeId: string, inputs: Record<string, unknown>) {
    const supabase = await createClient();

    if (toolId === "deploy_vercel") {
        const vercelToken = env.VERCEL_TOKEN;

        if (!vercelToken) {
            return { success: false, message: "Server Error: VERCEL_TOKEN missing in environment variables." };
        }

        // 1. Parse Repo URL to extract user/repo
        // Expected format: https://github.com/user/repo
        const repoUrl = inputs.repoUrl as string | undefined;
        if (!repoUrl || typeof repoUrl !== 'string') {
            return { success: false, message: "Missing or invalid repo URL." };
        }
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);

        if (!match) {
            return { success: false, message: "Invalid GitHub URL. Format: https://github.com/user/repo" };
        }

        const [, org, repo] = match;
        // Remove .git if present
        const cleanRepo = repo.replace(/\.git$/, "");
        const repoString = `${org}/${cleanRepo}`;

        try {
            // 2. Call Vercel API to create a deployment
            // Docs: https://vercel.com/docs/rest-api/endpoints/deployments#create-a-new-deployment
            const response = await fetch("https://api.vercel.com/v13/deployments", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${vercelToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: cleanRepo, // Project name
                    gitSource: {
                        type: "github",
                        repo: repoString,
                        ref: "main" // Defaulting to main, could be an input
                    },
                    projectSettings: {
                        framework: null // Auto-detect
                    }
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Vercel API Error:", data);
                return { success: false, message: `Vercel Deployment Failed: ${data.error?.message || "Unknown error"}` };
            }

            // 3. Log success
            await supabase.from("node_chat_messages").insert({
                node_id: nodeId,
                role: "assistant",
                content: `🚀 **Deployment Triggered!**\n\n**Project:** ${data.name}\n**Inspector URL:** [View Deployment](${data.inspectorUrl})\n**Target:** Vercel`,
            });

            // 4. Update Node Status (Optional - e.g. set to 'in_progress')
            await supabase.from("roadmap_nodes").update({ status: "in_progress" }).eq("id", nodeId);

            return { success: true, message: "Deployment started successfully on Vercel!" };

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("Execute Tool Error:", error);
            return { success: false, message: `Execution failed: ${errorMessage}` };
        }
    }

    return { success: false, message: "Tool logic not implemented for this ID." };
}
