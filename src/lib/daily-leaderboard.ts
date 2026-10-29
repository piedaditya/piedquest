import { getClientId } from "./leaderboard";
import { getLocalDateString } from "./quiz-storage";
import {
  getDailyLeaderboardTop,
  getMyDailyRun,
  type DailyLeaderboardRow,
} from "./leaderboard.functions";

export type DailyRunRow = DailyLeaderboardRow;

/** Top 100 players for a given day: score DESC, then fastest time. */
export async function fetchDailyTop(
  quizDate: string = getLocalDateString(),
  limit = 100,
): Promise<DailyRunRow[]> {
  const rows = await getDailyLeaderboardTop({ quizDate });
  return rows.slice(0, Math.max(1, limit));
}

export async function fetchMyDailyRun(
  quizDate: string = getLocalDateString(),
): Promise<DailyRunRow | null> {
  const user_id = getClientId();
  if (!user_id) return null;
  return getMyDailyRun({ clientId: user_id, quizDate });
}

// Daily runs are written server-side after answer verification
// (see src/lib/leaderboard.functions.ts).

/** 01:42.350 */
export function formatMs(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const rest = total % 1000;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(rest).padStart(3, "0")}`;
}
