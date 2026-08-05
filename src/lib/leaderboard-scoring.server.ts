// Server-only scoring for the Global Daily Challenge.
// The client never decides its own score: it submits the answer TEXT it picked
// for each question, and the server re-derives the quiz for that date from the
// deterministic question bank and counts the matches itself.
import { buildGlobalDaily, DAILY_QUESTION_COUNT } from "./global-daily";

export interface DailySubmission {
  clientId: string;
  username: string;
  quizDate: string;
  answers: (string | null)[];
  timeMs: number;
  tabSwitches: number;
  disqualified: boolean;
}

function utcDateString(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

/** Accept today's date +/- 1 day so local timezones still line up. */
function isAcceptableDate(date: string): boolean {
  return [utcDateString(-1), utcDateString(0), utcDateString(1)].includes(date);
}

function normalize(v: string): string {
  return v.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function recordDailyResult(input: DailySubmission) {
  const clientId = input.clientId.trim();
  const username = input.username.trim().slice(0, 32) || "Player";

  if (clientId.length < 8 || clientId.length > 64) throw new Error("Invalid client id");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.quizDate) || !isAcceptableDate(input.quizDate)) {
    throw new Error("Invalid quiz date");
  }

  const quiz = buildGlobalDaily(input.quizDate);
  const correct = quiz.questions.map((q) => normalize(q.choices[q.correctIndex] ?? ""));

  const answers = input.answers.slice(0, DAILY_QUESTION_COUNT);
  let score = 0;
  for (let i = 0; i < correct.length; i++) {
    const a = answers[i];
    if (typeof a === "string" && normalize(a) === correct[i]) score++;
  }

  const disqualified = input.disqualified === true;
  if (disqualified) score = 0;

  const timeMs = Math.max(0, Math.min(86_400_000, Math.round(input.timeMs || 0)));
  const tabSwitches = Math.max(0, Math.min(1000, Math.round(input.tabSwitches || 0)));

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: dailyError } = await supabaseAdmin.from("daily_leaderboard").upsert(
    {
      user_id: clientId,
      username,
      quiz_date: input.quizDate,
      score,
      time_ms: timeMs,
      tab_switches: tabSwitches,
      disqualified,
    },
    { onConflict: "user_id,quiz_date" },
  );
  if (dailyError) throw new Error("Could not save your run");

  // Streak + XP are derived from verified runs only, never from the client.
  const { data: runs } = await supabaseAdmin
    .from("daily_leaderboard")
    .select("quiz_date, score")
    .eq("user_id", clientId)
    .order("quiz_date", { ascending: false })
    .limit(400);

  const rows = runs ?? [];
  const xp = Math.min(10_000_000, rows.reduce((sum, r) => sum + Math.max(0, r.score), 0) * 10);

  let streak = 0;
  let expected = input.quizDate;
  for (const r of rows) {
    if (r.quiz_date > input.quizDate) continue;
    if (r.quiz_date !== expected) break;
    streak++;
    expected = new Date(new Date(`${expected}T00:00:00Z`).getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10);
  }
  streak = Math.min(10_000, streak);

  const { error: boardError } = await supabaseAdmin.from("leaderboard").upsert(
    {
      client_id: clientId,
      username,
      streak,
      xp,
      score: Math.min(5, score),
    },
    { onConflict: "client_id" },
  );
  if (boardError) throw new Error("Could not update the leaderboard");

  return { score, streak, xp };
}
