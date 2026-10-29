import { createServerFn } from "@tanstack/react-start";

export interface SubmitDailyInput {
  clientId: string;
  username: string;
  quizDate: string;
  answers: (string | null)[];
  timeMs: number;
  tabSwitches: number;
  disqualified: boolean;
}

export const submitDailyResult = createServerFn({ method: "POST" })
  .inputValidator((input: SubmitDailyInput) => {
    if (!input || typeof input.clientId !== "string" || typeof input.quizDate !== "string") {
      throw new Error("Invalid submission");
    }
    return {
      clientId: input.clientId,
      username: typeof input.username === "string" ? input.username : "Player",
      quizDate: input.quizDate,
      answers: Array.isArray(input.answers)
        ? input.answers.slice(0, 15).map((a) => (typeof a === "string" ? a.slice(0, 300) : null))
        : [],
      timeMs: Number(input.timeMs) || 0,
      tabSwitches: Number(input.tabSwitches) || 0,
      disqualified: input.disqualified === true,
    } satisfies SubmitDailyInput;
  })
  .handler(async ({ data }) => {
    const { recordDailyResult } = await import("./leaderboard-scoring.server");
    return recordDailyResult(data);
  });

/* ------------------------------------------------------------------ */
/* Leaderboard reads.                                                  */
/*                                                                     */
/* The leaderboard tables are not readable by anon/authenticated       */
/* roles anymore — every read goes through these server functions,     */
/* which return only the public scoreboard fields. Writes are already  */
/* server-only (see leaderboard-scoring.server.ts).                    */
/* ------------------------------------------------------------------ */

export interface GlobalLeaderboardRow {
  id: string;
  client_id: string;
  username: string;
  streak: number;
  xp: number;
  score: number;
  updated_at: string;
}

export interface DailyLeaderboardRow {
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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const getLeaderboardByXp = createServerFn({ method: "GET" }).handler(
  async (): Promise<GlobalLeaderboardRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leaderboard")
      .select("id, client_id, username, streak, xp, score, updated_at")
      .order("xp", { ascending: false })
      .order("streak", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as GlobalLeaderboardRow[];
  },
);

export const getLeaderboardByStreak = createServerFn({ method: "GET" }).handler(
  async (): Promise<GlobalLeaderboardRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leaderboard")
      .select("id, client_id, username, streak, xp, score, updated_at")
      .order("streak", { ascending: false })
      .order("xp", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as GlobalLeaderboardRow[];
  },
);

export const getDailyLeaderboardTop = createServerFn({ method: "POST" })
  .inputValidator((input: { quizDate?: string }) => {
    const quizDate = typeof input?.quizDate === "string" && DATE_RE.test(input.quizDate)
      ? input.quizDate
      : new Date().toISOString().slice(0, 10);
    return { quizDate };
  })
  .handler(async ({ data }): Promise<DailyLeaderboardRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("daily_leaderboard")
      .select(
        "id, user_id, username, quiz_date, score, time_ms, tab_switches, disqualified, created_at",
      )
      .eq("quiz_date", data.quizDate)
      .order("disqualified", { ascending: true })
      .order("score", { ascending: false })
      .order("time_ms", { ascending: true })
      .limit(100);
    if (error) return [];
    return (rows ?? []) as DailyLeaderboardRow[];
  });

export const getMyDailyRun = createServerFn({ method: "POST" })
  .inputValidator((input: { clientId?: string; quizDate?: string }) => {
    const clientId = typeof input?.clientId === "string" ? input.clientId.trim() : "";
    if (clientId.length < 8 || clientId.length > 64) return null;
    const quizDate = typeof input?.quizDate === "string" && DATE_RE.test(input.quizDate)
      ? input.quizDate
      : new Date().toISOString().slice(0, 10);
    return { clientId, quizDate };
  })
  .handler(async ({ data }): Promise<DailyLeaderboardRow | null> => {
    if (!data) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("daily_leaderboard")
      .select(
        "id, user_id, username, quiz_date, score, time_ms, tab_switches, disqualified, created_at",
      )
      .eq("quiz_date", data.quizDate)
      .eq("user_id", data.clientId)
      .maybeSingle();
    return (row as DailyLeaderboardRow | null) ?? null;
  });
