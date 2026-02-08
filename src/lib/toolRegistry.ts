import { LucideIcon, Globe, Briefcase, BadgeDollarSign, Rocket } from "lucide-react";

export type ToolId = "deploy_vercel" | "incorporate_stripe" | "setup_bank" | "create_entity";

export interface ToolDefinition {
    id: ToolId;
    name: string;
    description: string;
    icon: LucideIcon;
    actionUrl?: string; // For external links
    isAutomated: boolean; // True if handled by server action, False if just a guide/link
    requiredInputs?: {
        key: string;
        label: string;
        type: "text" | "url" | "select";
    }[];
}

export const ACTION_REGISTRY: Record<ToolId, ToolDefinition> = {
    deploy_vercel: {
        id: "deploy_vercel",
        name: "Deploy to Vercel",
        description: "Launch your MVP to a live URL.",
        icon: Rocket,
        isAutomated: true, // We'll mock the automation
        requiredInputs: [
            { key: "repoUrl", label: "GitHub Repo URL", type: "url" },
        ]
    },
    incorporate_stripe: {
        id: "incorporate_stripe",
        name: "Incorporate via Atlas",
        description: "Form your Delaware C-Corp.",
        icon: Globe,
        actionUrl: "https://atlas.stripe.com",
        isAutomated: false
    },
    create_entity: {
        id: "create_entity",
        name: "Register Legal Entity",
        description: "Legal formation documentation.",
        icon: Briefcase,
        isAutomated: false
    },
    setup_bank: {
        id: "setup_bank",
        name: "Open Bank Account",
        description: "Mercury or Brex setup.",
        icon: BadgeDollarSign,
        isAutomated: false
    }
};

// Map Node Types (or titles/categories) to compatible Tools
export function getToolsForNode(nodeTitle: string, nodeType?: string): ToolDefinition[] {
    const tools: ToolDefinition[] = [];
    const lowerTitle = nodeTitle.toLowerCase();

    if (lowerTitle.includes("deploy") || lowerTitle.includes("hosting") || lowerTitle.includes("mvp")) {
        tools.push(ACTION_REGISTRY.deploy_vercel);
    }

    if (lowerTitle.includes("incorporate") || lowerTitle.includes("legal") || lowerTitle.includes("entity")) {
        tools.push(ACTION_REGISTRY.incorporate_stripe);
        tools.push(ACTION_REGISTRY.create_entity);
    }

    if (lowerTitle.includes("bank") || lowerTitle.includes("finance")) {
        tools.push(ACTION_REGISTRY.setup_bank);
    }

    return tools;
}
