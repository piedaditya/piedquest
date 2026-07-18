const KEY = "dailyquest_state_v1";

export interface QuizStorage {
  lastPlayedDate: string | null; // YYYY-MM-DD (local)
  lastScore: number | null;
  lastPattern: boolean[] | null;
  lastQuizNumber: number | null;
  streak: number;
  bestScore: number;
}

const defaultState: QuizStorage = {
  lastPlayedDate: null,
  lastScore: null,
  lastPattern: null,
  lastQuizNumber: null,
  streak: 0,
  bestScore: 0,
};

export function getLocalDateString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isYesterday(prev: string, today: string): boolean {
  const p = new Date(prev + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - p.getTime()) / 86400000);
  return diff === 1;
}

export function readStorage(): QuizStorage {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function writeStorage(state: QuizStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function recordCompletion(params: {
  score: number;
  pattern: boolean[];
  quizNumber: number;
}): QuizStorage {
  const today = getLocalDateString();
  const prev = readStorage();

  let streak = prev.streak;
  if (prev.lastPlayedDate === today) {
    // already recorded, keep
  } else if (prev.lastPlayedDate && isYesterday(prev.lastPlayedDate, today)) {
    streak = prev.streak + 1;
  } else {
    streak = 1;
  }

  const next: QuizStorage = {
    lastPlayedDate: today,
    lastScore: params.score,
    lastPattern: params.pattern,
    lastQuizNumber: params.quizNumber,
    streak,
    bestScore: Math.max(prev.bestScore, params.score),
  };
  writeStorage(next);
  return next;
}

export function hasPlayedToday(state: QuizStorage): boolean {
  return state.lastPlayedDate === getLocalDateString();
}

export function msUntilMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

export function getCurrentStreak(state: QuizStorage): number {
  if (!state.lastPlayedDate) return 0;
  const today = getLocalDateString();
  if (state.lastPlayedDate === today) return state.streak;
  if (isYesterday(state.lastPlayedDate, today)) return state.streak;
  return 0;
}