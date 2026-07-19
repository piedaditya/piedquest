import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, Flame, Home, Trophy, Zap } from "lucide-react";
import { BgGlow, Logo } from "@/lib/quest-ui";
import { getLevelInfo, readStorage, type QuizStorage } from "@/lib/quiz-storage";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

type Player = {
  handle: string;
  avatar: string;
  streak: number;
  xp: number;
  fandom: string;
};

const WEEKLY_LEADERS: Player[] = [
  { handle: "@kaijusenpai", avatar: "🐉", streak: 148, xp: 12480, fandom: "Anime" },
  { handle: "@lore_master", avatar: "📜", streak: 121, xp: 10980, fandom: "Movies" },
  { handle: "@pixel_witch", avatar: "🎮", streak: 97, xp: 9430, fandom: "Gaming" },
  { handle: "@midnight_owl", avatar: "🦉", streak: 88, xp: 8720, fandom: "TV" },
  { handle: "@vinyl_hero", avatar: "🎧", streak: 74, xp: 7610, fandom: "Music" },
  { handle: "@stan_supreme", avatar: "⭐", streak: 66, xp: 6900, fandom: "Pop Culture" },
  { handle: "@quest_ronin", avatar: "🥷", streak: 52, xp: 5480, fandom: "Anime" },
  { handle: "@raid_captain", avatar: "🛡️", streak: 47, xp: 4990, fandom: "Gaming" },
  { handle: "@fandom_fox", avatar: "🦊", streak: 41, xp: 4210, fandom: "TV" },
  { handle: "@popcorn_ghost", avatar: "🍿", streak: 33, xp: 3560, fandom: "Movies" },
];

const RISING_ROOKIES: Player[] = [
  { handle: "@newbie_ace", avatar: "🌱", streak: 12, xp: 1240, fandom: "Anime" },
  { handle: "@caffeine_arc", avatar: "☕", streak: 9, xp: 980, fandom: "Gaming" },
  { handle: "@rookie_bard", avatar: "🎤", streak: 7, xp: 720, fandom: "Music" },
  { handle: "@stream_kid", avatar: "📺", streak: 6, xp: 640, fandom: "TV" },
  { handle: "@lore_intern", avatar: "🗝️", streak: 5, xp: 520, fandom: "Movies" },
];

function LeaderboardRoute() {
  const [tab, setTab] = useState<"weekly" | "rookies">("weekly");
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());
  useEffect(() => setStorage(readStorage()), []);
  const level = getLevelInfo(storage.xp);

  const rows = tab === "weekly" ? WEEKLY_LEADERS : RISING_ROOKIES;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <section className="mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Global Leaderboard
          </span>
          <h1 className="font-display mt-5 text-5xl text-foreground">
            Top of the fandom.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This week's streak champs and rising rookies. New scores every Monday.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1">
          <TabBtn active={tab === "weekly"} onClick={() => setTab("weekly")}>
            Weekly
          </TabBtn>
          <TabBtn active={tab === "rookies"} onClick={() => setTab("rookies")}>
            Rising Rookies
          </TabBtn>
        </div>

        <ol className="mt-6 space-y-2">
          {rows.map((p, i) => (
            <li
              key={p.handle}
              className="flex items-center gap-3 rounded-2xl border border-border p-3.5 transition-all hover:border-primary/40"
              style={{
                background:
                  i === 0
                    ? "linear-gradient(90deg, oklch(0.28 0.15 122 / 0.25), oklch(0.19 0.035 285 / 0.6))"
                    : "oklch(0.19 0.035 285 / 0.6)",
              }}
            >
              <span
                className={`font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : i < 3
                      ? "bg-accent/30 text-accent"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
              </span>
              <span className="text-2xl">{p.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display truncate text-base text-foreground">
                  {p.handle}
                </p>
                <p className="text-xs text-muted-foreground">{p.fandom}</p>
              </div>
              <div className="text-right">
                <p className="inline-flex items-center gap-1 font-display text-sm text-primary">
                  <Flame className="h-3.5 w-3.5" />
                  {p.streak}
                </p>
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  {p.xp.toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <section
          className="mt-8 rounded-3xl border border-border p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 300 / 0.55), oklch(0.19 0.035 285 / 0.7))",
          }}
        >
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
            Your rank
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-xl font-display text-lg text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.55 0.22 305))",
              }}
            >
              {level.level}
            </div>
            <div className="flex-1">
              <p className="font-display text-base text-foreground">You · {level.title}</p>
              <p className="text-xs text-muted-foreground">
                {level.totalXp} XP · Keep playing to climb the ranks.
              </p>
            </div>
          </div>
        </section>

        <Link
          to="/"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 font-display text-sm uppercase tracking-wider transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      style={active ? { boxShadow: "0 0 20px -8px oklch(0.92 0.22 122 / 0.6)" } : undefined}
    >
      {children}
    </button>
  );
}