// Tracks question IDs the user got wrong, so future rounds can re-inject
// them as a "Review Challenge". Simple ring in localStorage.
const KEY = "dailyquest_wrong_v1";
const MAX = 50;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(ids.slice(-MAX)));
}

export function addWrongId(id: string): void {
  const cur = read();
  if (cur.includes(id)) return;
  write([...cur, id]);
}

export function removeWrongId(id: string): void {
  const cur = read();
  write(cur.filter((x) => x !== id));
}

export function getWrongIds(): string[] {
  return read();
}

/** Pick one wrong-id present in `pool` that isn't in `excludeIds`. */
export function pickReviewQuestion<T extends { id: string }>(
  pool: readonly T[],
  excludeIds: Set<string>,
): T | null {
  const wrongs = read();
  if (!wrongs.length) return null;
  const candidates = pool.filter((q) => wrongs.includes(q.id) && !excludeIds.has(q.id));
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
