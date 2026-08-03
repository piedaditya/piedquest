// Fisher-Yates option shuffling with dynamic re-mapping of the correct answer.
// Prevents the "correct answer is always A or B" bias coming out of the
// database, the mock pools and the AI generators.

export interface ShufflableQuestion {
  choices: string[];
  correctIndex: number;
}

/**
 * Returns a copy of the question with its options shuffled and `correctIndex`
 * re-pointed at wherever the correct text landed.
 */
export function shuffleOptions<T extends ShufflableQuestion>(q: T): T {
  if (!Array.isArray(q.choices) || q.choices.length < 2) return q;
  const correctText = q.choices[q.correctIndex];
  const arr = q.choices.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  let nextIndex = arr.indexOf(correctText);
  if (nextIndex < 0) nextIndex = 0;
  return { ...q, choices: arr, correctIndex: nextIndex };
}

export function shuffleOptionsAll<T extends ShufflableQuestion>(list: readonly T[]): T[] {
  return list.map((q) => shuffleOptions(q));
}
