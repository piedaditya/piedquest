// Session-scoped memory of AI-generated questions so the model never repeats
// itself while the user keeps playing.
const KEY = "piedquest_ai_asked_v1";

export function getAskedQuestions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function rememberAskedQuestions(texts: string[]): void {
  if (typeof window === "undefined" || !texts.length) return;
  const next = Array.from(new Set([...getAskedQuestions(), ...texts])).slice(-120);
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota — ignore */
  }
}
