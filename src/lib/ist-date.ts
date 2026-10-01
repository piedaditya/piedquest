/** Current calendar date (YYYY-MM-DD) in Indian Standard Time (UTC+5:30). */
export function istDate(now: number = Date.now()): string {
  return new Date(now + 330 * 60_000).toISOString().slice(0, 10);
}
