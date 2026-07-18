import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock, Flame, Share2, Sparkles, Trophy } from "lucide-react";
import {
  dailyQuizQueryOptions,
  type DailyQuiz,
} from "@/lib/quiz-queries";
import {
  getCurrentStreak,
  hasPlayedToday,
  msUntilMidnight,
  readStorage,
  recordCompletion,
  type QuizStorage,
} from "@/lib/quiz-storage";

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
      <QuestApp />
    </Suspense>
  );
}

type Stage = "landing" | "playing" | "results";

function QuestApp() {
  const { data } = useSuspenseQuery(dailyQuizQueryOptions);
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());
  const [stage, setStage] = useState<Stage>("landing");
  const [answers, setAnswers] = useState<boolean[]>([]);

  useEffect(() => {
    const s = readStorage();
    setStorage(s);
    if (hasPlayedToday(s)) setStage("results");
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

  const streak = getCurrentStreak(storage);

  if (stage === "playing") {
    return (
      <Playing
        quiz={data}
        onComplete={(pattern) => {
          const score = pattern.filter(Boolean).length;
          const next = recordCompletion({
            score,
            pattern,
            quizNumber: data.quizNumber,
          });
          setStorage(next);
          setAnswers(pattern);
          setStage("results");
        }}
      />
    );
  }

  if (stage === "results" || hasPlayedToday(storage)) {
    return (
      <Results
        quiz={data}
        storage={storage}
        pattern={
          answers.length ? answers : (storage.lastPattern ?? [])
        }
      />
    );
  }

  return (
    <Landing
      quiz={data}
      streak={streak}
      onStart={() => setStage("playing")}
    />
  );
}

// -------- Shared UI --------

function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <BgGlow />
      <div className="relative z-10 flex w-full max-w-lg items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function BgGlow() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-40 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "oklch(0.55 0.22 305 / 0.4)" }}
      />
    </>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm">Loading today's quest…</p>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 place-items-center rounded-xl font-display text-lg text-background"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.55 0.22 305))",
          boxShadow: "0 0 24px -6px oklch(0.55 0.22 305 / 0.7)",
        }}
      >
        Q
      </div>
      <span className="font-display text-xl tracking-tight text-foreground">
        DAILYQUEST
      </span>
    </div>
  );
}

function LivePill({ quizNumber }: { quizNumber: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      Quest #{quizNumber} is live
    </span>
  );
}

function StreakPill({ streak }: { streak: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-display text-xs uppercase tracking-wider text-primary">
      <Flame className="h-3.5 w-3.5" />
      {streak} Day Streak
    </span>
  );
}

// -------- Landing --------

function Landing({
  quiz,
  streak,
  onStart,
}: {
  quiz: DailyQuiz;
  streak: number;
  onStart: () => void;
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

          <button
            onClick={onStart}
            className="group relative mt-8 inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            Play Today's Challenge
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

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

// -------- Playing --------

function Playing({
  quiz,
  onComplete,
}: {
  quiz: DailyQuiz;
  onComplete: (pattern: boolean[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [pattern, setPattern] = useState<boolean[]>([]);
  const [visible, setVisible] = useState(true);

  const total = quiz.questions.length;
  const q = quiz.questions[index];

  const handlePick = (i: number) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const isCorrect = i === q.correctIndex;
    const nextPattern = [...pattern, isCorrect];
    setPattern(nextPattern);

    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (index + 1 >= total) {
          onComplete(nextPattern);
        } else {
          setIndex(index + 1);
          setSelected(null);
          setLocked(false);
          setVisible(true);
        }
      }, 250);
    }, 800);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-10 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            Q{index + 1}/{total}
          </span>
        </div>

        <div className="mt-6 flex gap-1.5">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background:
                  i < index
                    ? "var(--primary)"
                    : i === index
                      ? "oklch(0.55 0.22 305)"
                      : "var(--border)",
              }}
            />
          ))}
        </div>

        <div
          className="mt-10 flex-1 transition-all duration-300"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
          }}
          key={q.id}
        >
          {q.category && (
            <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
              {q.category}
            </p>
          )}
          <h2 className="font-display mt-3 text-3xl leading-tight text-foreground sm:text-4xl">
            {q.question}
          </h2>

          <div className="mt-8 space-y-3">
            {q.choices.map((choice, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              const showState = locked && (isSelected || isCorrect);
              let stateClass =
                "border-border bg-card hover:border-primary/40 hover:bg-primary/5";
              if (showState) {
                if (isCorrect) {
                  stateClass =
                    "border-primary bg-primary/15 text-primary-foreground";
                } else if (isSelected) {
                  stateClass =
                    "border-destructive bg-destructive/15";
                }
              }
              return (
                <button
                  key={i}
                  disabled={locked}
                  onClick={() => handlePick(i)}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${stateClass} disabled:cursor-not-allowed`}
                >
                  <span
                    className={`font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm transition-colors ${
                      showState && isCorrect
                        ? "bg-primary text-primary-foreground"
                        : showState && isSelected
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-secondary text-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span
                    className={`text-base font-medium ${showState && isCorrect ? "text-primary" : "text-foreground"}`}
                  >
                    {choice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- Results --------

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
    const url =
      typeof window !== "undefined" ? window.location.origin : "";
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
      </div>
    </div>
  );
}

function NextQuestCountdown() {
  const [ms, setMs] = useState<number>(() => msUntilMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="mt-8 rounded-3xl border border-border p-6 text-center" style={{ background: "oklch(0.19 0.035 285 / 0.6)" }}>
      <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
        Next quest drops in
      </p>
      <p className="font-display mt-3 text-5xl text-primary tabular-nums">
        {pad(h)}:{pad(m)}:{pad(s)}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Locked until midnight local time. Come back tomorrow.
      </p>
    </div>
  );
}
