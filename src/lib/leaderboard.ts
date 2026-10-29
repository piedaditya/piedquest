import {
  getLeaderboardByStreak,
  getLeaderboardByXp,
  type GlobalLeaderboardRow,
} from "./leaderboard.functions";

const CLIENT_ID_KEY = "dailyquest_client_id_v1";
const USERNAME_KEY = "dailyquest_username_v1";

const ADJECTIVES = [
  "Neon", "Cosmic", "Pixel", "Rogue", "Shadow", "Turbo", "Lucky", "Vivid",
  "Hyper", "Mystic", "Chrome", "Retro", "Vinyl", "Solar", "Lunar", "Feral",
];
const NOUNS = [
  "Ronin", "Bard", "Ghost", "Fox", "Witch", "Kaiju", "Sage", "Nomad",
  "Ace", "Falcon", "Otaku", "Warden", "Rebel", "Oracle", "Comet", "Drifter",
];

function randomHandle(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900 + 100);
  return `${a}${n}${num}`;
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export function getUsername(): string {
  if (typeof window === "undefined") return "Player";
  let name = localStorage.getItem(USERNAME_KEY);
  if (!name) {
    name = randomHandle();
    localStorage.setItem(USERNAME_KEY, name);
  }
  return name;
}

export function setUsername(name: string): string {
  const trimmed = name.trim().slice(0, 32) || randomHandle();
  localStorage.setItem(USERNAME_KEY, trimmed);
  return trimmed;
}

export type LeaderboardRow = GlobalLeaderboardRow;

export async function fetchTopLeaderboard(limit = 10): Promise<LeaderboardRow[]> {
  const rows = await getLeaderboardByXp();
  return rows.slice(0, Math.max(1, limit));
}

export async function fetchTopByStreak(limit = 10): Promise<LeaderboardRow[]> {
  const rows = await getLeaderboardByStreak();
  return rows.slice(0, Math.max(1, limit));
}

// Leaderboard reads and writes are both server-side: the client cannot
// query or write the leaderboard tables directly.
