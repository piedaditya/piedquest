// Lightweight fuzzy matching for Typing Mode so minor typos still count.
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(the|a|an)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length];
}

export function isFuzzyMatch(input: string, accepted: string[]): boolean {
  const guess = normalize(input);
  if (!guess) return false;
  return accepted.some((candidate) => {
    const target = normalize(candidate);
    if (!target) return false;
    if (guess === target) return true;
    if (target.length > 6 && (guess.includes(target) || target.includes(guess)))
      return true;
    const tolerance = target.length <= 4 ? 1 : target.length <= 9 ? 2 : 3;
    return levenshtein(guess, target) <= tolerance;
  });
}
