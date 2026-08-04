import { bankFor, TIER_PLAN, type Tier, type BankQuestion } from "./global-daily-bank";
import { shuffleOptions } from "./shuffle-options";
import type { DailyQuiz, Question } from "./quiz-queries";

export const DAILY_QUESTION_COUNT = 15;

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return s / 4294967296;
  };
}

function pick(pool: BankQuestion[], count: number, rng: () => number): BankQuestion[] {
  const arr = pool.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

/**
 * Deterministic per-date global daily challenge: 15 universal, educational
 * questions on a strict easy -> medium -> hard -> extreme curve.
 */
export function buildGlobalDaily(date: string): DailyQuiz {
  const seed = hashString(`piedquest-global-daily-${date}`);
  const rng = makeRng(seed);

  const counts: Record<Tier, number> = { easy: 0, medium: 0, hard: 0, extreme: 0 };
  for (const t of TIER_PLAN) counts[t] += 1;

  const picked: Record<Tier, BankQuestion[]> = {
    easy: pick(bankFor("easy"), counts.easy, rng),
    medium: pick(bankFor("medium"), counts.medium, rng),
    hard: pick(bankFor("hard"), counts.hard, rng),
    extreme: pick(bankFor("extreme"), counts.extreme, rng),
  };

  const cursor: Record<Tier, number> = { easy: 0, medium: 0, hard: 0, extreme: 0 };
  const quizNumber = (seed % 9000) + 1000;

  const questions: Question[] = TIER_PLAN.map((tier, i) => {
    const b = picked[tier][cursor[tier]++];
    return shuffleOptions<Question>({
      id: `gdc-${date}-${i}`,
      quizNumber,
      order: i,
      question: b.q,
      choices: b.choices,
      correctIndex: b.correct,
      category: b.topic,
      explanation: b.nugget,
      difficulty: tier,
    });
  });

  return { quizDate: date, quizNumber, questions };
}
