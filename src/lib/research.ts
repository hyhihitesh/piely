import Exa from "exa-js";
import { env } from "@/lib/env";

const exaClient = env.EXA_API_KEY
  ? new Exa(env.EXA_API_KEY)
  : null;

export interface ResearchInsights {
  competitors?: string[];
  marketTrends?: string[];
  keyChallenges?: string[];
  opportunities?: string[];
  sources?: Array<{ title: string; url: string; snippet: string }>;
}

export async function researchStartupIdea(
  idea: string,
): Promise<ResearchInsights> {
  if (!exaClient) {
    return {};
  }

  try {
    // Search for competitors and market info
    const competitorQuery = `${idea} competitors alternatives`;
    const marketQuery = `${idea} market trends 2024 2025`;

    const [competitorResults, marketResults] = await Promise.all([
      exaClient.search(competitorQuery, {
        numResults: 5,
        useAutoprompt: true,
      }),
      exaClient.search(marketQuery, {
        numResults: 5,
        useAutoprompt: true,
      }),
    ]);

    const competitors: string[] = [];
    const marketTrends: string[] = [];
    const sources: Array<{ title: string; url: string; snippet: string }> = [];

    // Define minimal type for Exa results
    interface ExaSearchResult {
      title?: string;
      url?: string;
      text?: string;
    }

    (competitorResults.results as ExaSearchResult[])?.forEach((result) => {
      if (result.title) {
        competitors.push(result.title);
      }
      if (result.url && result.text) {
        sources.push({
          title: result.title || "Untitled",
          url: result.url,
          snippet: result.text.substring(0, 200),
        });
      }
    });

    (marketResults.results as ExaSearchResult[])?.forEach((result) => {
      if (result.text) {
        marketTrends.push(result.text.substring(0, 150));
      }
      if (result.url && result.text && !sources.find((s) => s.url === result.url)) {
        sources.push({
          title: result.title || "Untitled",
          url: result.url,
          snippet: result.text.substring(0, 200),
        });
      }
    });


    return {
      competitors: competitors.slice(0, 5),
      marketTrends: marketTrends.slice(0, 5),
      sources: sources.slice(0, 10),
    };
  } catch (error) {
    console.error("Research error:", error);
    return {};
  }
}
