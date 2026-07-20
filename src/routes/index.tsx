import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, Clock, Flame, Infinity as InfinityIcon, Share2, Sparkles, Trophy, Users, Zap } from "lucide-react";
import {
  dailyQuizQueryOptions,
  FANDOM_CATEGORIES,
  type DailyQuiz,
} from "@/lib/quiz-queries";
import {
  getCurrentStreak,
  getLevelInfo,
  hasPlayedToday,
  readStorage,
  setFavoriteFandom,
  type QuizStorage,
} from "@/lib/quiz-storage";
import {
  BgGlow,
  FullBleed,
  Loader,
  LivePill,
  Logo,
  NextQuestCountdown,
  StreakPill,
} from "@/lib/quest-ui";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dailyQuizQueryOptions),
  component: Index,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Today's quest didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
  notFoundComponent: () => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">No quest today</h2>
        <p className="mt-2 text-sm text-muted-foreground">Come back tomorrow.</p>
      </div>
    </FullBleed>
  ),
});

function Index() {
  return (
    <Suspense fallback={<FullBleed><Loader /></FullBleed>}>
      <LandingContainer />
    </Suspense>
  );
}

function LandingContainer() {
  const { data } = useSuspenseQuery(dailyQuizQueryOptions);
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());

  useEffect(() => {
    setStorage(readStorage());
  }, []);

  return (
    <Landing
      quiz={data}
      storage={storage}
      onFandomChange={(f) => setStorage(setFavoriteFandom(f))}
      streak={getCurrentStreak(storage)}
      playedToday={hasPlayedToday(storage)}
    />
  );
}

function Landing({
  quiz,
  storage,
  onFandomChange,
  streak,
  playedToday,
}: {
  quiz: DailyQuiz | null;
  storage: QuizStorage;
  onFandomChange: (f: string | null) => void;
  streak: number;
  playedToday: boolean;
}) {
  const level = getLevelInfo(storage.xp);
  const activeFandom = storage.favoriteFandom ?? "All Fandoms";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <ProfileCard
          level={level.level}
          title={level.title}
          currentXp={level.currentXp}
          neededXp={level.neededXp}
          totalXp={level.totalXp}
          streak={streak}
        />

        <section className="mt-10">
          {quiz ? <LivePill quizNumber={quiz.quizNumber} /> : (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 font-display text-xs uppercase tracking-widest text-muted-foreground">
              No quest today
            </span>
          )}
          <h1 className="font-display mt-6 text-[3.4rem] leading-[0.95] text-foreground sm:text-6xl">
            Test Your Fandom.
            <br />
            Every Single Day.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            One character. Six clues. A fresh test of your pop-culture brain
            every 24 hours.
          </p>

          {quiz ? (
            <Link
              to={playedToday ? "/results" : "/quiz"}
              className="group relative mt-8 inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              {playedToday ? "View Today's Results" : "Play Today's Challenge"}
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ) : (
            <Link
              to="/practice"
              className="group relative mt-8 inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Try Practice Mode
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          )}

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            60 seconds
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            No signup. No spoilers.
          </p>
        </section>

        <FandomHub active={activeFandom} onChange={onFandomChange} />

        {playedToday && <NextQuestCountdown />}

        <PracticeCard fandom={activeFandom} />

        <LeaderboardTeaser />

        <section
          className="mt-14 rounded-3xl border border-border p-5"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.22 0.05 300 / 0.4), oklch(0.19 0.035 285 / 0.6))",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
            Today's Mystery
          </p>
          <div className="mt-3">
            <StreakPill streak={streak} />
          </div>

          <div
            className="relative mt-5 grid aspect-square place-items-center overflow-hidden rounded-2xl border border-border"
            style={{ background: "oklch(0.16 0.03 285)" }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "var(--gradient-mystery)" }}
            />
            <span className="relative font-display text-[10rem] leading-none text-muted-foreground/40">
              ?
            </span>
            <p className="absolute bottom-4 font-display text-xs uppercase tracking-[0.25em] text-accent">
              5 Clues Ready · {quiz?.questions[0]?.category ?? "Mystery"}
            </p>
          </div>
        </section>

        <section className="mt-16">
          <p className="font-display text-center text-xs uppercase tracking-[0.25em] text-primary">
            The Daily Loop
          </p>
          <h2 className="font-display mt-3 text-center text-4xl text-foreground">
            Three moves. Infinite bragging rights.
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Built to fit your coffee break. Designed to take over the group chat.
          </p>

          <div className="mt-8 space-y-4">
            <LoopCard n="01" title="Guess the character." icon={<Sparkles className="h-5 w-5" />}>
              One question. Four choices. Trust the part of your brain filled with lore.
            </LoopCard>
            <LoopCard n="02" title="Build your streak." icon={<Flame className="h-5 w-5" />}>
              Show up daily, climb the ranks, and protect that tiny flame with your life.
            </LoopCard>
            <LoopCard n="03" title="Flex the group chat." icon={<Share2 className="h-5 w-5" />}>
              Copy your emoji-grid score in one tap. Watch the replies roll in.
            </LoopCard>
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p className="font-display uppercase tracking-widest">DailyQuest</p>
          <p className="mt-1">Come back tomorrow at midnight for a fresh mystery.</p>
        </footer>
      </div>
    </div>
  );
}

function ProfileCard({
  level,
  title,
  currentXp,
  neededXp,
  totalXp,
  streak,
}: {
  level: number;
  title: string;
  currentXp: number;
  neededXp: number;
  totalXp: number;
  streak: number;
}) {
  const pct = Math.min(100, Math.round((currentXp / neededXp) * 100));
  return (
    <div
      className="mt-8 rounded-3xl border border-border p-5"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.06 300 / 0.55), oklch(0.19 0.035 285 / 0.7))",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-2xl text-primary-foreground"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.55 0.22 305))",
            boxShadow: "0 0 30px -6px oklch(0.92 0.22 122 / 0.6)",
          }}
        >
          {level}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-accent">
            Level {level}
          </p>
          <p className="font-display truncate text-xl text-foreground">{title}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-display text-xs uppercase tracking-wider text-primary">
          <Flame className="h-3.5 w-3.5" />
          {streak}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            {currentXp} / {neededXp} XP
          </span>
          <span>{totalXp} total</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, oklch(0.92 0.22 122), oklch(0.55 0.22 305))",
              boxShadow: "0 0 12px -2px oklch(0.92 0.22 122 / 0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function FandomHub({
  active,
  onChange,
}: {
  active: string;
  onChange: (f: string | null) => void;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-xs uppercase tracking-[0.25em] text-primary">
          Fandom Hub
        </p>
        <span className="text-xs text-muted-foreground">Filters practice</span>
      </div>
      <h2 className="font-display mt-2 text-2xl text-foreground">
        Pick your fandom.
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {FANDOM_CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat === "All Fandoms" ? null : cat)}
              className={`rounded-full border px-4 py-2 font-display text-xs uppercase tracking-wider transition-all ${
                isActive
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={isActive ? { boxShadow: "0 0 20px -8px oklch(0.92 0.22 122 / 0.6)" } : undefined}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PracticeCard({ fandom }: { fandom: string }) {
  return (
    <section
      className="mt-8 rounded-3xl border border-border p-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.28 0.12 305 / 0.35), oklch(0.19 0.035 285 / 0.7))",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
          <InfinityIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
            Practice Mode
          </p>
          <p className="font-display text-xl text-foreground">Infinite Archive</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Warm up on past questions from <span className="text-primary">{fandom}</span>.
        Doesn't affect your streak — but every correct answer still earns +10 XP.
      </p>
      <Link
        to="/practice"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3.5 font-display text-base text-primary transition-all hover:bg-primary/20"
      >
        Start Practice Round
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function LeaderboardTeaser() {
  return (
    <section
      className="mt-8 rounded-3xl border border-border p-6"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.28 0.15 122 / 0.15), oklch(0.19 0.035 285 / 0.7))",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-xs uppercase tracking-[0.25em] text-primary">
            Global Leaderboard
          </p>
          <p className="font-display text-xl text-foreground">Top of the fandom</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Peek at this week's streak champions and rising rookies.
      </p>
      <Link
        to="/leaderboard"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 font-display text-base text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
      >
        View Leaderboard
        <Trophy className="h-4 w-4" />
      </Link>
    </section>
  );
}

function LoopCard({
  n,
  title,
  icon,
  children,
}: {
  n: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl border border-border p-6"
      style={{ background: "oklch(0.19 0.035 285 / 0.7)" }}
    >
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
          {icon}
        </div>
        <span className="font-display text-sm text-primary">{n}</span>
      </div>
      <h3 className="font-display mt-8 text-2xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
