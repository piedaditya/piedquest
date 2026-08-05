// Direct Google Gemini API caller. Used when a GEMINI_API_KEY secret is set,
// so AI features keep working independently of the Lovable AI gateway credits.
const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

export function hasGeminiKey(): boolean {
  return Boolean(process.env["GEMINI_API_KEY"]);
}

export async function callGemini(args: {
  system: string;
  prompt: string;
  json?: boolean;
}): Promise<string> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured");

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

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    throw new Error(`Gemini request failed [${res.status}]: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
  ).trim();
}
