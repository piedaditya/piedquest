import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Home, Share2, ShieldAlert, Timer, Trophy } from "lucide-react";
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
import { getClientId, getUsername } from "@/lib/leaderboard";
import { formatMs } from "@/lib/daily-leaderboard";
import { submitDailyResult } from "@/lib/leaderboard.functions";
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
    const clientId = getClientId();
    if (!clientId) return;
    // Scores are verified and written server-side; the client only reports the
    // answers it picked.
    void submitDailyResult({
      data: {
        clientId,
        username: getUsername(),
        quizDate: s.lastPlayedDate ?? getLocalDateString(),
        answers: s.lastAnswers ?? [],
        timeMs: s.lastTimeMs ?? 0,
        tabSwitches: s.lastTabSwitches,
        disqualified: s.lastDisqualified,
      },
    }).catch(() => undefined);
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
  const timedOut = storage.lastTimedOut === true;
  const disqualified = storage.lastDisqualified === true;
  const timeMs = storage.lastTimeMs ?? 0;
  const total = 15;
  const [copied, setCopied] = useState(false);

  const emojiGrid = useMemo(() => {
    const cells = pattern.map((c) => (c ? "🟩" : "🟥"));
    const rows: string[] = [];
    for (let i = 0; i < cells.length; i += 5) rows.push(cells.slice(i, i + 5).join(""));
    return rows.join("\n");
  }, [pattern]);

  const shareText = useMemo(() => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const line = disqualified
      ? "❌ Disqualified for cheating"
      : `⏱ ${formatMs(timeMs)}`;
    return `Piedquest Global Daily #${quiz.quizNumber} — ${score}/${total}\n${line}\n\n${emojiGrid}\n\n🔥 ${streak} Day Streak!\n\nPlay at ${url}`;
  }, [quiz.quizNumber, score, emojiGrid, streak, disqualified, timeMs]);

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

  const verdict = disqualified
    ? "Disqualified."
    : timedOut
      ? "Time's up."
      : score === 15
        ? "Flawless."
        : score >= 12
          ? "Top tier."
          : score >= 8
            ? "Solid run."
            : score >= 4
              ? "Room to grow."
              : "Ouch.";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <div className="mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Global Daily #{quiz.quizNumber} · Complete
          </span>
          {disqualified && (
            <span
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/15 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-destructive"
              style={{ boxShadow: "0 0 26px -8px var(--destructive)" }}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              Disqualified for Cheating
            </span>
          )}
          {timedOut && (
            <span
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-destructive/50 bg-destructive/15 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-destructive"
              style={{ boxShadow: "0 0 26px -8px var(--destructive)" }}
            >
              <Timer className="h-3.5 w-3.5" />
              Time's Up!
            </span>
          )}
          <h1 className="font-display mt-6 text-6xl text-foreground">
            {verdict}
          </h1>
          <p className="mt-3 text-muted-foreground">
            You got <span className="text-primary">{score} out of {total}</span> today
            {!disqualified && (
              <>
                {" "}in <span className="text-primary tabular-nums">{formatMs(timeMs)}</span>
              </>
            )}
            .
            {disqualified && " Tab switching locked your score at 0."}
            {storage.lastTabSwitches === 1 &&
              !disqualified &&
              " A +10s anti-cheat penalty was included."}
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
          <p className="mt-6 whitespace-pre-line text-center text-3xl leading-relaxed tracking-[0.15em]">
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
          to="/leaderboard"
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 px-6 py-5 font-display text-lg text-primary transition-all hover:bg-primary/15"
        >
          <Trophy className="h-5 w-5" />
          See Global Rankings
        </Link>

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