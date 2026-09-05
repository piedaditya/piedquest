// Server-only helpers for AI question generation via Lovable AI Gateway.
export interface AiQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}


export function buildPrompt(
  category: string,
  region: string,
  count: number,
  asked: string[],
): string {
  const scope =
    region && region !== "Global"
      ? `${category} in ${region}`
      : `${category} (globally famous, recognizable worldwide)`;
  const avoid = asked.length
    ? `\n\nDo NOT repeat or paraphrase any of these already-asked questions:\n- ${asked
        .slice(-60)
        .join("\n- ")}`
    : "";
  return `Generate ${count} highly educational, difficult multiple-choice trivia questions about ${scope}. Each must have exactly 4 options with exactly one correct answer, plus a short educational explanation (1-2 sentences).

LENGTH RULE (critical): every question_text must be 20-25 words MAX, readable in under 4 seconds. No dense historical background, no long parenthetical native terms, no lore setup before the question. Difficulty must come from the answer, not from long text.
BAD: "In the Silla Kingdom's Bone-Rank System (Golpum-je), aristocrats of the 'Head Rank 6' (Yuk-dupum) were barred from the top five bureaucratic ranks regardless of talent. What was the highest official rank (Gwanpum) they could attain?"
GOOD: "In ancient Korea's Silla Kingdom, what was the highest official rank a 'Head Rank 6' aristocrat could attain?"

Return output strictly as JSON with this shape:
{"questions":[{"question_text":"...","options":["a","b","c","d"],"correct_answer":"exact text of the correct option","explanation":"..."}]}${avoid}`;
}

export function parseAiQuestions(raw: string): AiQuestion[] {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  let payload: unknown;
  try {
    payload = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return [];
  }
  const list = (payload as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) return [];
  const out: AiQuestion[] = [];
  for (const item of list) {
    const q = item as Record<string, unknown>;
    const question = typeof q["question_text"] === "string" ? q["question_text"] : "";
    const options = Array.isArray(q["options"])
      ? (q["options"] as unknown[]).filter((o): o is string => typeof o === "string")
      : [];
    const answer = typeof q["correct_answer"] === "string" ? q["correct_answer"] : "";
    const explanation = typeof q["explanation"] === "string" ? q["explanation"] : "";
    if (!question || options.length !== 4) continue;
    let correctIndex = options.findIndex(
      (o) => o.trim().toLowerCase() === answer.trim().toLowerCase(),
    );
    if (correctIndex < 0) correctIndex = 0;
    out.push({ question, choices: options, correctIndex, explanation });
  }
  return out;
}

export async function generateQuestions(args: {
  category: string;
  region: string;
  count: number;
  asked: string[];
}): Promise<AiQuestion[]> {
  const system =
    "You are a trivia master. You always answer with valid JSON only, no markdown fences. Questions must be factually accurate, never repeated, and 20-25 words MAX.";
  const prompt = buildPrompt(args.category, args.region, args.count, args.asked);

  try {
    const { callGateway } = await import("./ai-gateway.server");
    return parseAiQuestions(await callGateway({ system, prompt, json: true }));
  } catch (error) {
    const { hasGeminiKey, callGemini } = await import("./gemini.server");
    if (!hasGeminiKey()) throw error;
    return parseAiQuestions(await callGemini({ system, prompt, json: true }));
  }
}
