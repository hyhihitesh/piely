export type StartupStage = "validation" | "build" | "growth";

export interface StageDefinition {
    id: StartupStage;
    label: string;
    description: string;
    recommendedModules: string[];
}

export const STAGES: Record<StartupStage, StageDefinition> = {
    validation: {
        id: "validation",
        label: "Validation & Research",
        description: "You have an idea but need to prove the market exists.",
        recommendedModules: ["market_analysis", "competitor_grid", "problem_solution_fit"],
    },
    build: {
        id: "build",
        label: "Build & MVP",
        description: "You are building the product and need technical planning.",
        recommendedModules: ["tech_stack", "mvp_scope", "user_stories"],
    },
    growth: {
        id: "growth",
        label: "Growth & Scale",
        description: "You have a product and need to acquire users/investors.",
        recommendedModules: ["pitch_deck", "financial_model", "gtm_strategy"],
    },
};

export const ONBOARDING_SYSTEM_PROMPT = `
You are an expert Startup Consultant AI. Your goal is to determine the user's "Startup Stage" (Validation, Build, or Growth).

The user has an idea: "{{USER_IDEA}}".

Ask 1-2 targeted questions to figure out:
1. Do they have customers/revenue? (If yes -> Growth)
2. Do they have a product? (If yes -> Growth/Build)
3. Is it just an idea? (If yes -> Validation)

Keep questions short (under 20 words). Be conversational but professional.
Once you are confident, output a JSON object ONLY:
{ "stage": "validation" | "build" | "growth", "reasoning": "..." }
`;
