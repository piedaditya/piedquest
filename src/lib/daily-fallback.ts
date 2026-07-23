import { getMockPool } from "./practice-mocks";
import type { DailyQuiz, Question } from "./quiz-queries";

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic per-date global daily quiz built from the globally-famous
// mock pool. Excludes GK Regional / regional Movies so every player worldwide
// gets the same 5 universally-recognizable questions.
export function buildFallbackDailyQuiz(date: string): DailyQuiz {
  const pool = getMockPool(null);
  const seed = hashString(`piedquest-daily-${date}`);
  const picks: Question[] = [];
  const used = new Set<number>();
  let s = seed || 1;
  while (picks.length < 5 && used.size < pool.length) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const idx = s % pool.length;
    if (used.has(idx)) continue;
    used.add(idx);
    const q = pool[idx];
    picks.push({
      ...q,
      id: `daily-${date}-${picks.length}`,
      quizNumber: (seed % 9000) + 1000,
      order: picks.length,
    });
  }
  return {
    quizDate: date,
    quizNumber: (seed % 9000) + 1000,
    questions: picks,
  };
}