import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, Clock, Flame, Share2, Sparkles, Trophy } from "lucide-react";
import {
  dailyQuizQueryOptions,
  type DailyQuiz,
} from "@/lib/quiz-queries";
import {
  getCurrentStreak,
  hasPlayedToday,
  readStorage,
  type QuizStorage,
} from "@/lib/quiz-storage";
import {
  BgGlow,
  FullBleed,
  Loader,
  LivePill,
  Logo,
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

  if (!data) {
    return (
      <FullBleed>
        <div className="text-center">
          <h2 className="font-display text-3xl">No quest today</h2>
          <p className="mt-2 text-sm text-muted-foreground">Come back tomorrow.</p>
        </div>
      </FullBleed>
    );
  }

  return (
    <Landing
      quiz={data}
      streak={getCurrentStreak(storage)}
      playedToday={hasPlayedToday(storage)}
    />
  );
}

function Landing({
  quiz,
  streak,
  playedToday,
}: {
  quiz: DailyQuiz;
  streak: number;
  playedToday: boolean;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <section className="mt-14">
          <LivePill quizNumber={quiz.quizNumber} />
          <h1 className="font-display mt-6 text-[3.4rem] leading-[0.95] text-foreground sm:text-6xl">
            Test Your Fandom.
            <br />
            Every Single Day.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground">
            One character. Six clues. A fresh test of your pop-culture brain
            every 24 hours.
          </p>

          <Link
            to={playedToday ? "/results" : "/quiz"}
            className="group relative mt-8 inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {playedToday ? "View Today's Results" : "Play Today's Challenge"}
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            60 seconds
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            No signup. No spoilers.
          </p>
        </section>

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
              Clue 01 / 05 · {quiz.questions[0].category ?? "Mystery"}
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
