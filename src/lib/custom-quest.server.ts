// Server-only generator for "My Own Quests" — builds a bespoke 5-question
// quiz for any topic via the Lovable AI Gateway.
export type Difficulty = "Easy" | "Normal" | "Hard" | "Extreme";
export type AnswerMode = "mcq" | "typing";

export interface GeneratedQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  answerText: string;
  acceptable: string[];
  explanation: string;
}

export interface QuestResult {
  questions: GeneratedQuestion[];
  notFound: boolean;
}

export const TOPIC_NOT_FOUND_MESSAGE =
  "Sorry, I searched the entire multiverse and couldn't find that! But try your best with another topic.";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are an elite, highly accurate trivia master. The user will give you a topic and a difficulty level.

ACCURACY: If the topic is a real-world academic subject, you must use the most up-to-date curriculum. For example, if asked about NCERT Class 12 Biology Chapter 1 updated syllabus, you must know that the old "Reproduction in Organisms" chapter was completely deleted, and you must generate questions on the new Chapter 1: "Sexual Reproduction in Flowering Plants".

FULL-SYLLABUS MODE: If the user inputs a full subject or syllabus (e.g. "Class 12 Bio (Full Syllabus)" or "JEE Main Chemistry"), distribute the questions evenly across all relevant chapters and units of that standard curriculum instead of clustering on one chapter. Ensure questions test genuine understanding, conceptual clarity and application — ideal for competitive exam preparation.

DIFFICULTY SCALING: If the user selects "Hard" or "Extreme", the multiple-choice options MUST be incredibly tricky. They should look highly similar to the correct answer to genuinely test the user's deep knowledge (e.g. mixing up flint and steel vs. obsidian and steel for Minecraft).

FALLBACK PROTOCOL: If the user types complete gibberish or a topic that does not exist in recorded human knowledge, do NOT make things up. Return exactly {"error":"TOPIC_NOT_FOUND"} and nothing else.

LENGTH RULE (critical): every question_text must be 20-25 words MAX and readable in under 4 seconds. No dense background text, no long parenthetical native terms, no lore setup before the question. Difficulty comes from the answer options, never from long text.
BAD: "In the Silla Kingdom's Bone-Rank System (Golpum-je), aristocrats of the 'Head Rank 6' (Yuk-dupum) were barred from the top five bureaucratic ranks regardless of talent. What was the highest official rank (Gwanpum) they could attain?"
GOOD: "In ancient Korea's Silla Kingdom, what was the highest official rank a 'Head Rank 6' aristocrat could attain?"

You always answer with valid JSON only, no markdown fences. Questions must be factually accurate, original and never trivially guessable.`;

const DIFFICULTY_HINT: Record<Difficulty, string> = {
  Easy: "simple one-line questions a beginner can answer",
  Normal: "standard general knowledge on the topic",
  Hard: "deep lore / technical knowledge that only enthusiasts know",
  Extreme: "highly obscure, competitive-exam level questions that stump experts",
};

export function buildQuestPrompt(args: {
  topic: string;
  difficulty: Difficulty;
  mode: AnswerMode;
  count: number;
  avoid?: string[];
}): string {
  const modeLine =
    args.mode === "typing"
      ? `Answers will be TYPED by the user, so "correct_answer" must be a short word or phrase (1-4 words, no punctuation). Also give "acceptable_answers": an array of 2-4 alternative spellings/abbreviations that should count as correct.`
      : `Provide exactly 4 plausible options, only one correct.`;

  const avoidLine =
    args.avoid && args.avoid.length
      ? `\nDo NOT repeat or rephrase any of these already-generated questions:\n- ${args.avoid.slice(-40).join("\n- ")}\n`
      : "";

  return `Create ${args.count} original multiple-choice trivia questions about: "${args.topic}".
Difficulty: ${args.difficulty} — ${DIFFICULTY_HINT[args.difficulty]}.
${modeLine}
${avoidLine}
Every question must be factually accurate and include a short, educational explanation (1-2 sentences).

Return ONLY JSON in this exact shape:
{"questions":[{"question_text":"...","options":["a","b","c","d"],"correct_answer":"exact text of the correct option","acceptable_answers":["..."],"fun_fact":"a short insightful fun fact explaining the answer"}]}

If the topic is gibberish or does not exist in recorded human knowledge, return ONLY {"error":"TOPIC_NOT_FOUND"}.`;
}

export function parseQuest(raw: string): GeneratedQuestion[] {
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

  const out: GeneratedQuestion[] = [];
  for (const item of list) {
    const q = item as Record<string, unknown>;
    const question = typeof q["question_text"] === "string" ? q["question_text"] : "";
    const options = Array.isArray(q["options"])
      ? (q["options"] as unknown[]).filter((o): o is string => typeof o === "string")
      : [];
    const answer = typeof q["correct_answer"] === "string" ? q["correct_answer"] : "";
    const explanation = typeof q["explanation"] === "string" ? q["explanation"] : "";
    const funFact = typeof q["fun_fact"] === "string" ? q["fun_fact"] : "";
    const acceptable = Array.isArray(q["acceptable_answers"])
      ? (q["acceptable_answers"] as unknown[]).filter((o): o is string => typeof o === "string")
      : [];
    if (!question || !answer) continue;
    const choices = options.length === 4 ? options : [];
    let correctIndex = choices.findIndex(
      (o) => o.trim().toLowerCase() === answer.trim().toLowerCase(),
    );
    if (choices.length === 4 && correctIndex < 0) correctIndex = 0;
    out.push({
      question,
      choices,
      correctIndex: correctIndex < 0 ? 0 : correctIndex,
      answerText: choices[correctIndex] ?? answer,
      acceptable: Array.from(new Set([answer, ...acceptable])),
      explanation: explanation || funFact,
    });
  }
  return out;
}

export function isTopicNotFound(raw: string): boolean {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return false;
  try {
    const payload = JSON.parse(raw.slice(start, end + 1)) as { error?: unknown };
    return typeof payload.error === "string" && payload.error.toUpperCase().includes("TOPIC_NOT_FOUND");
  } catch {
    return false;
  }
}

export async function generateCustomQuest(args: {
  topic: string;
  difficulty: Difficulty;
  mode: AnswerMode;
  count: number;
}): Promise<QuestResult> {
  const { hasGeminiKey, callGemini } = await import("./gemini.server");
  if (hasGeminiKey()) {
    const text = await callGemini({
      system: SYSTEM_PROMPT,
      prompt: buildQuestPrompt(args),
      json: true,
    });
    if (isTopicNotFound(text)) return { questions: [], notFound: true };
    return { questions: parseQuest(text), notFound: false };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured");

  const response = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildQuestPrompt(args) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429)
      throw new Error("AI is busy right now — try again in a moment.");
    if (response.status === 402)
      throw new Error("AI credits exhausted. Add credits to keep forging quests.");
    throw new Error(`AI request failed [${response.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (isTopicNotFound(content)) return { questions: [], notFound: true };
  return { questions: parseQuest(content), notFound: false };
}
