// Direct Google Gemini API caller. Used when a GEMINI_API_KEY secret is set,
// so AI features keep working independently of the Lovable AI gateway credits.
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export function hasGeminiKey(): boolean {
  return Boolean(process.env["GEMINI_API_KEY"]);
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Exponential backoff schedule: 2s, then 4s, then 8s (3 retries max). */
const BACKOFF_MS = [2000, 4000, 8000];

export const HIGH_DEMAND_MESSAGE =
  "The AI is experiencing high demand right now. Please try again in a few moments.";

export async function callGemini(args: {
  system: string;
  prompt: string;
  json?: boolean;
}): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured");

  const maxAttempts = BACKOFF_MS.length + 1;
  let lastStatus = 0;


  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: args.system }] },
        contents: [{ role: "user", parts: [{ text: args.prompt }] }],
        generationConfig: args.json
          ? { responseMimeType: "application/json" }
          : undefined,
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      return (
        data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
        ""
      ).trim();
    }

    const body = await res.text();
    lastStatus = res.status;

    if (RETRYABLE.has(res.status) && attempt < maxAttempts - 1) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const delay =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : (BACKOFF_MS[attempt] ?? 8000) + Math.random() * 400;
      await sleep(delay);
      continue;
    }

    if (RETRYABLE.has(res.status)) {
      throw new Error(HIGH_DEMAND_MESSAGE);
    }

    throw new Error(`Gemini request failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  throw new Error(
    `The AI is experiencing high demand right now (${lastStatus}). Please try again shortly.`,
  );
}

