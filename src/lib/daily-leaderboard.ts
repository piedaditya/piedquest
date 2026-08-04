import { supabase } from "@/integrations/supabase/client";
import { getClientId, getUsername } from "./leaderboard";
import { getLocalDateString } from "./quiz-storage";

export interface DailyRunRow {
  id: string;
  user_id: string;
  username: string;
  quiz_date: string;
  score: number;
  time_ms: number;
  tab_switches: number;
  disqualified: boolean;
  created_at: string;
}

const COLS =
  "id, user_id, username, quiz_date, score, time_ms, tab_switches, disqualified, created_at";

/** Top 100 players for a given day: score DESC, then fastest time. */
export async function fetchDailyTop(
  quizDate: string = getLocalDateString(),
  limit = 100,
): Promise<DailyRunRow[]> {
  const { data, error } = await supabase
    .from("daily_leaderboard")
    .select(COLS)
    .eq("quiz_date", quizDate)
    .order("disqualified", { ascending: true })
    .order("score", { ascending: false })
    .order("time_ms", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DailyRunRow[];
}

export async function fetchMyDailyRun(
  quizDate: string = getLocalDateString(),
): Promise<DailyRunRow | null> {
  const user_id = getClientId();
  if (!user_id) return null;
  const { data, error } = await supabase
    .from("daily_leaderboard")
    .select(COLS)
    .eq("quiz_date", quizDate)
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) return null;
  return (data as DailyRunRow | null) ?? null;
}

export async function submitDailyRun(params: {
  score: number;
  timeMs: number;
  tabSwitches: number;
  disqualified: boolean;
  quizDate?: string;
}): Promise<void> {
  const user_id = getClientId();
  const username = getUsername();
  if (!user_id) return;
  const { error } = await supabase.from("daily_leaderboard").upsert(
    {
      user_id,
      username,
      quiz_date: params.quizDate ?? getLocalDateString(),
      score: Math.max(0, Math.min(15, Math.round(params.score))),
      time_ms: Math.max(0, Math.min(86_400_000, Math.round(params.timeMs))),
      tab_switches: Math.max(0, Math.min(1000, params.tabSwitches)),
      disqualified: params.disqualified,
    },
    { onConflict: "user_id,quiz_date" },
  );
  if (error) console.error("daily leaderboard submit failed", error);
}

/** 01:42.350 */
export function formatMs(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const rest = total % 1000;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(rest).padStart(3, "0")}`;
}
