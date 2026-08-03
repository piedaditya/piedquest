import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const QUICK_QA_SYSTEM_PROMPT = `Provide a clean, short, and highly insightful answer to the user's question. Focus on clarity and ease of understanding, strictly avoiding long paragraphs.

Rules: answer in plain text (no markdown symbols, no code fences, no SVG). Use at most 120 words. Prefer 3-5 crisp lines or short dashes. Lead with the direct answer, then one line of "why it matters" if useful.`;
