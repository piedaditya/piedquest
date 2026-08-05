const KEY = "dailyquest_state_v1";

export interface QuizStorage {
  lastPlayedDate: string | null; // YYYY-MM-DD (local)
  lastScore: number | null;
  lastPattern: boolean[] | null;
  lastAnswers: (string | null)[] | null;
  lastQuizNumber: number | null;
  lastTimedOut: boolean;
  lastTimeMs: number | null;
  lastTabSwitches: number;
  lastDisqualified: boolean;
  streak: number;
  bestScore: number;
  xp: number;
  favoriteFandom: string | null;
  practiceCount: number;
  region: string;
  gkScope: "global" | "regional";
}

const defaultState: QuizStorage = {
  lastPlayedDate: null,
  lastScore: null,
  lastPattern: null,
  lastAnswers: null,
  lastQuizNumber: null,
  lastTimedOut: false,
  lastTimeMs: null,
  lastTabSwitches: 0,
  lastDisqualified: false,
  streak: 0,
  bestScore: 0,
  xp: 0,
  favoriteFandom: null,
  practiceCount: 0,
  region: "Global",
  gkScope: "global",
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
  answers?: (string | null)[];
  quizNumber: number;
  timedOut?: boolean;
  timeMs?: number;
  tabSwitches?: number;
  disqualified?: boolean;
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
    ...prev,
    lastPlayedDate: today,
    lastScore: params.score,
    lastPattern: params.pattern,
    lastAnswers: params.answers ?? null,
    lastQuizNumber: params.quizNumber,
    lastTimedOut: params.timedOut ?? false,
    lastTimeMs: params.timeMs ?? null,
    lastTabSwitches: params.tabSwitches ?? 0,
    lastDisqualified: params.disqualified ?? false,
    streak,
    bestScore: Math.max(prev.bestScore, params.score),
    xp: prev.xp + params.score * 10,
  };
  writeStorage(next);
  return next;
}

export function recordPractice(correctCount: number): QuizStorage {
  const prev = readStorage();
  const next: QuizStorage = {
    ...prev,
    xp: prev.xp + correctCount * 10,
    practiceCount: prev.practiceCount + 1,
  };
  writeStorage(next);
  return next;
}

export function setFavoriteFandom(fandom: string | null): QuizStorage {
  const prev = readStorage();
  const next: QuizStorage = { ...prev, favoriteFandom: fandom };
  writeStorage(next);
  return next;
}

export function setRegion(region: string): QuizStorage {
  const prev = readStorage();
  const next: QuizStorage = { ...prev, region };
  writeStorage(next);
  return next;
}

export function setGkScope(gkScope: "global" | "regional"): QuizStorage {
  const prev = readStorage();
  const next: QuizStorage = { ...prev, gkScope };
  writeStorage(next);
  return next;
}

const LEVEL_XP = 100;

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number; // xp within current level
  neededXp: number; // xp needed to next level
  progress: number; // 0..1
  totalXp: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const currentXp = xp % LEVEL_XP;
  const title =
    level >= 20
      ? "Trivia Legend"
      : level >= 11
        ? "Lore Master"
        : level >= 6
          ? "Fandom Expert"
          : level >= 3
            ? "Fandom Rookie"
            : "Trivia Novice";
  return {
    level,
    title,
    currentXp,
    neededXp: LEVEL_XP,
    progress: currentXp / LEVEL_XP,
    totalXp: xp,
  };
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