import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Home, Share2, Trophy } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
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
import { upsertLeaderboardEntry } from "@/lib/leaderboard";
import {
  BgGlow,
  FullBleed,
  Loader,
  Logo,
  NextQuestCountdown,
  StreakPill,
} from "@/lib/quest-ui";

export const Route = createFileRoute("/results")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !hasPlayedToday(readStorage())) {
      throw redirect({ to: "/", replace: true });
    }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dailyQuizQueryOptions),
  component: ResultsRoute,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Results didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
});

function ResultsRoute() {
  return (
    <Suspense fallback={<FullBleed><Loader /></FullBleed>}>
      <ResultsContainer />
    </Suspense>
  );
}

function ResultsContainer() {
  const { data } = useSuspenseQuery(dailyQuizQueryOptions);
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());

  useEffect(() => {
    setStorage(readStorage());
  }, []);

  useEffect(() => {
    const s = readStorage();
    if (s.lastScore == null) return;
    void upsertLeaderboardEntry({
      streak: getCurrentStreak(s),
      xp: s.xp,
      score: s.lastScore,
    });
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
    <Results
      quiz={data}
      storage={storage}
      pattern={storage.lastPattern ?? []}
    />
  );
}

function Results({
  quiz,
  storage,
  pattern,
}: {
  quiz: DailyQuiz;
  storage: QuizStorage;
  pattern: boolean[];
}) {
  const score = storage.lastScore ?? pattern.filter(Boolean).length;
  const streak = getCurrentStreak(storage);
  const [copied, setCopied] = useState(false);

  const emojiGrid = useMemo(
    () => pattern.map((c) => (c ? "🟩" : "🟥")).join(""),
    [pattern],
  );

  const shareText = useMemo(() => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    return `DailyQuest #${quiz.quizNumber} — ${score}/5\n\n${emojiGrid}\n\n🔥 ${streak} Day Streak!\n\nPlay at ${url}`;
  }, [quiz.quizNumber, score, emojiGrid, streak]);

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        // ignore
      }
    }
  };

  const verdict =
    score === 5 ? "Flawless." : score >= 4 ? "Certified fan." : score >= 2 ? "Not bad." : "Ouch.";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <div className="mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Quest #{quiz.quizNumber} · Complete
          </span>
          <h1 className="font-display mt-6 text-6xl text-foreground">
            {verdict}
          </h1>
          <p className="mt-3 text-muted-foreground">
            You got <span className="text-primary">{score} out of 5</span> today.
          </p>
        </div>

        <div
          className="mt-8 rounded-3xl border border-border p-6"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.22 0.05 300 / 0.4), oklch(0.19 0.035 285 / 0.6))",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
              Your grid
            </p>
            <StreakPill streak={streak} />
          </div>
          <p className="mt-6 text-center text-5xl tracking-[0.15em]">
            {emojiGrid}
          </p>

          <button
            onClick={onShare}
            className="group mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 font-display text-xl text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Share2 className="h-5 w-5" />
            {copied ? "Copied!" : "Share Score"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {copied
              ? "Grid copied to clipboard — go flex."
              : "Copies an emoji grid. No spoilers."}
          </p>
        </div>

        <NextQuestCountdown />

        <Link
          to="/"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-[0.99]"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}