/**
 * Shared player-economy model + guest (localStorage) persistence.
 * All time math takes an explicit `now` from the secure server clock.
 */

export const MAX_HEARTS = 5;
export const HEART_REFILL_MS = 30 * 60 * 1000; // one heart every 30 minutes
const GUEST_KEY = "piedquest_guest_profile_v1";
const LEGACY_HEARTS_KEY = "piedquest_hearts";

export type PlayerRole = "guest" | "registered";
export type PlayerTier = "free" | "gold" | "special";

export interface PlayerState {
  id: string | null;
  role: PlayerRole;
  xp: number;
  hearts: number;
  /** ms epoch of the last heart deduction (refill anchor) */
  heartsUpdatedAt: number;
  /** ms epoch of the last recorded login */
  lastLogin: number;
  streak: number;
  activeTier: PlayerTier;
}

export function defaultGuest(now: number): PlayerState {
  return {
    id: null,
    role: "guest",
    xp: 0,
    hearts: MAX_HEARTS,
    heartsUpdatedAt: now,
    lastLogin: now,
    streak: 1,
    activeTier: "free",
  };
}

/* ---------------- guest storage ---------------- */

export function readGuest(now: number): PlayerState {
  if (typeof window === "undefined") return defaultGuest(now);
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return { ...defaultGuest(now), ...JSON.parse(raw), role: "guest" as const };
  } catch {
    /* ignore */
  }
  const base = defaultGuest(now);
  const legacy = localStorage.getItem(LEGACY_HEARTS_KEY);
  if (legacy !== null) {
    const parsed = parseInt(legacy, 10);
    if (Number.isFinite(parsed)) base.hearts = Math.max(0, Math.min(MAX_HEARTS, parsed));
  }
  return base;
}

export function writeGuest(state: PlayerState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_KEY, JSON.stringify(state));
  localStorage.setItem(LEGACY_HEARTS_KEY, String(state.hearts));
}

export function clearGuest(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(LEGACY_HEARTS_KEY);
}

/* ---------------- hearts ---------------- */

/** Grants any hearts earned since the refill anchor. Pure. */
export function applyHeartRefill(state: PlayerState, now: number): PlayerState {
  if (state.hearts >= MAX_HEARTS) {
    return state.heartsUpdatedAt === now ? state : { ...state, heartsUpdatedAt: now };
  }
  const elapsed = Math.max(0, now - state.heartsUpdatedAt);
  const earned = Math.floor(elapsed / HEART_REFILL_MS);
  if (earned <= 0) return state;
  const hearts = Math.min(MAX_HEARTS, state.hearts + earned);
  const anchor = hearts >= MAX_HEARTS ? now : state.heartsUpdatedAt + earned * HEART_REFILL_MS;
  return { ...state, hearts, heartsUpdatedAt: anchor };
}

/** ms until the next heart arrives; 0 when hearts are full. */
export function msToNextHeart(state: PlayerState, now: number): number {
  if (state.hearts >= MAX_HEARTS) return 0;
  const elapsed = Math.max(0, now - state.heartsUpdatedAt);
  return Math.max(0, HEART_REFILL_MS - (elapsed % HEART_REFILL_MS));
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------------- streak ---------------- */

function dayIndex(ms: number): number {
  return Math.floor(ms / 86400000);
}

/**
 * New day -> +1 streak. More than 48h since last login -> reset to 0 (then 1 for today).
 */
export function applyStreak(state: PlayerState, now: number): PlayerState {
  const gap = now - state.lastLogin;
  if (dayIndex(now) === dayIndex(state.lastLogin)) {
    return state.streak > 0 ? state : { ...state, streak: 1 };
  }
  const streak = gap > 48 * 3600 * 1000 ? 1 : state.streak + 1;
  return { ...state, streak, lastLogin: now };
}
