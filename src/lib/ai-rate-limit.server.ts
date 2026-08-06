// Server-side abuse control for the paid AI gateway endpoints.
// The budget key is derived from the request itself (IP / proxy headers), never
// from client-supplied data, so it cannot be spoofed by scripting the endpoint.
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

export const AI_DAILY_LIMITS = {
  practice_questions: 120,
  custom_quest: 300,
  quick_qa: 60,
} as const;

export type AiFeature = keyof typeof AI_DAILY_LIMITS;

export class AiRateLimitError extends Error {
  constructor() {
    super("You've reached today's AI limit. Please try again tomorrow.");
    this.name = "AiRateLimitError";
  }
}

function requestKey(): string {
  try {
    const ip =
      getRequestIP({ xForwardedFor: true }) ??
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-real-ip") ??
      "";
    return (ip || "unknown").slice(0, 100);
  } catch {
    return "unknown";
  }
}

/** Consumes one unit of the caller's daily budget; throws once it's exhausted. */
export async function enforceAiBudget(feature: AiFeature): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("consume_ai_budget", {
    _client_key: requestKey(),
    _feature: feature,
    _limit: AI_DAILY_LIMITS[feature],
  });
  // Fail open on infrastructure errors so a DB blip doesn't break the app,
  // but fail closed whenever the budget check actually returns "over limit".
  if (error) {
    console.error("AI budget check failed", error.message);
    return;
  }
  if (data === false) throw new AiRateLimitError();
}
