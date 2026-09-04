// Server-only 30-day anti-repetition memory for AI-generated questions.
import { createHash } from "crypto";

export function hashQuestion(text: string): string {
  return createHash("sha256")
    .update(text.trim().toLowerCase().replace(/\s+/g, " "))
    .digest("hex")
    .slice(0, 40);
}

export interface HistoryOwner {
  userId: string | null;
  clientKey: string;
}

/** Question texts this player has already seen in the last 30 days. */
export async function readRecentHistory(
  owner: HistoryOwner,
  topic?: string,
): Promise<string[]> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    let query = supabaseAdmin
      .from("question_history")
      .select("question_text")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(120);

    query = owner.userId
      ? query.eq("user_id", owner.userId)
      : query.eq("client_key", owner.clientKey);
    if (topic) query = query.eq("topic", topic.trim().toLowerCase().slice(0, 200));

    const { data, error } = await query;
    if (error || !data) return [];
    return data
      .map((row) => (row as { question_text: string | null }).question_text ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** Records freshly generated questions so they never come back within 30 days. */
export async function recordHistory(
  owner: HistoryOwner,
  topic: string,
  questions: string[],
): Promise<void> {
  if (!questions.length) return;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedTopic = topic.trim().toLowerCase().slice(0, 200);
    await supabaseAdmin.from("question_history").insert(
      questions.map((q) => ({
        user_id: owner.userId,
        client_key: owner.clientKey,
        topic: normalizedTopic,
        question_hash: hashQuestion(q),
        question_text: q.slice(0, 500),
      })),
    );
  } catch (e) {
    console.error("question_history insert failed", e);
  }
}
