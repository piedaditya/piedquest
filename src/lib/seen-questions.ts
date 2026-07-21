// Tracks question IDs the user has already answered so the shuffler
// serves fresh questions until the pool is exhausted.
const KEY = "dailyquest_seen_v1";

type SeenMap = Record<string, string[]>; // bucket -> question ids

function read(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(map: SeenMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function bucketFor(category: string | null): string {
  return `practice:${category ?? "All Fandoms"}`;
}

export function getSeen(bucket: string): Set<string> {
  const map = read();
  return new Set(map[bucket] ?? []);
}

export function markSeen(bucket: string, ids: string[]): void {
  if (!ids.length) return;
  const map = read();
  const existing = new Set(map[bucket] ?? []);
  ids.forEach((id) => existing.add(id));
  map[bucket] = Array.from(existing);
  write(map);
}

export function resetSeen(bucket: string): void {
  const map = read();
  delete map[bucket];
  write(map);
}

// Fisher-Yates shuffle — unbiased, O(n).
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Draw `count` questions from `pool`, preferring items not in `seen`.
 * If unseen < count, top up with a fresh shuffle of the seen pool
 * (and reset the seen bucket so the cycle restarts next round).
 */
export function drawFreshRound<T extends { id: string }>(
  pool: readonly T[],
  seen: Set<string>,
  count: number,
): { picks: T[]; exhausted: boolean } {
  const unseen = shuffle(pool.filter((q) => !seen.has(q.id)));
  if (unseen.length >= count) {
    return { picks: unseen.slice(0, count), exhausted: false };
  }
  // Pool exhausted — take everything unseen, then top up from a re-shuffled
  // full pool (excluding what we already picked to avoid dup inside the round).
  const picks = unseen.slice();
  const pickedIds = new Set(picks.map((p) => p.id));
  const remainder = shuffle(pool.filter((q) => !pickedIds.has(q.id)));
  picks.push(...remainder.slice(0, Math.max(0, count - picks.length)));
  return { picks, exhausted: true };
}