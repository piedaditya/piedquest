// Returns a deterministic-per-day image URL for a category using loremflickr.
// No API key required, tags relate to the fandom category.
const CATEGORY_TAGS: Record<string, string> = {
  Anime: "anime,manga,cosplay",
  Gaming: "videogame,arcade,gamer,console",
  "Pop Culture": "concert,neon,celebrity,poster",
  Movies: "cinema,movie,film,poster",
  TV: "television,studio,retro-tv",
  Music: "concert,vinyl,guitar,neon",
};

export function mysteryImageUrl(category: string | null | undefined, seed: string): string {
  const tags = CATEGORY_TAGS[category ?? ""] ?? "pop-culture,neon,cinematic";
  const lock = Math.abs(hashString(`${category ?? "all"}-${seed}`)) % 100000;
  return `https://loremflickr.com/800/800/${encodeURIComponent(tags)}?lock=${lock}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
