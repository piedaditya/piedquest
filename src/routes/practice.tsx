import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Home, Infinity as InfinityIcon, RefreshCw, Zap } from "lucide-react";
import {
  practicePoolQueryOptions,
  type Question,
} from "@/lib/quiz-queries";
import {
  getLevelInfo,
  readStorage,
  recordPractice,
  type QuizStorage,
} from "@/lib/quiz-storage";
import { BgGlow, FullBleed, Loader, Logo } from "@/lib/quest-ui";
import { bucketFor, drawFreshRound, getSeen, markSeen, resetSeen } from "@/lib/seen-questions";

export const Route = createFileRoute("/practice")({
  component: PracticeRoute,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Practice didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
  notFoundComponent: () => (
    <FullBleed>
      <div className="text-center">
        <h2 className="font-display text-3xl">No practice questions</h2>
      </div>
    </FullBleed>
  ),
});

function PracticeRoute() {
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());
  useEffect(() => setStorage(readStorage()), []);
  const fandom = storage.favoriteFandom;
  return (
    <Suspense fallback={<FullBleed><Loader /></FullBleed>}>
      <PracticeContainer
        fandom={fandom}
        onXpEarned={() => setStorage(readStorage())}
        storage={storage}
      />
    </Suspense>
  );
}

function PracticeContainer({
  fandom,
  onXpEarned,
  storage,
}: {
  fandom: string | null;
  onXpEarned: () => void;
  storage: QuizStorage;
}) {
  const { data } = useSuspenseQuery(practicePoolQueryOptions(fandom));
  const [round, setRound] = useState(0);
  const [justExhausted, setJustExhausted] = useState(false);

  const bucket = bucketFor(fandom);
  const { questions, exhausted } = useMemo(() => {
    const pool = data ?? [];
    const seen = getSeen(bucket);
    const { picks, exhausted } = drawFreshRound(pool, seen, 5);
    return { questions: picks, exhausted };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, round, bucket]);

  useEffect(() => {
    setJustExhausted(exhausted);
  }, [exhausted, round]);

  if (!questions.length) {
    return (
      <FullBleed>
        <div className="max-w-md text-center">
          <h2 className="font-display text-3xl">No questions yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another fandom on the home screen.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 font-display text-sm"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </FullBleed>
    );
  }

  return (
    <PracticePlay
      key={round}
      questions={questions}
      fandom={fandom ?? "All Fandoms"}
      storage={storage}
      exhaustedNotice={justExhausted}
      onFinish={(correct) => {
        markSeen(bucket, questions.map((q) => q.id));
        if (exhausted) resetSeen(bucket);
        recordPractice(correct);
        onXpEarned();
      }}
      onReplay={() => setRound((r) => r + 1)}
    />
  );
}

function PracticePlay({
  questions,
  fandom,
  storage,
  onFinish,
  onReplay,
  exhaustedNotice,
}: {
  questions: Question[];
  fandom: string;
  storage: QuizStorage;
  onFinish: (correct: number) => void;
  onReplay: () => void;
  exhaustedNotice?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [pattern, setPattern] = useState<boolean[]>([]);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[index];

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
          const correct = nextPattern.filter(Boolean).length;
          onFinish(correct);
          setDone(true);
        } else {
          setIndex(index + 1);
          setSelected(null);
          setLocked(false);
          setVisible(true);
        }
      }, 250);
    }, 800);
  };

  if (done) {
    const correct = pattern.filter(Boolean).length;
    const xp = correct * 10;
    const level = getLevelInfo(storage.xp + xp);
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <BgGlow />
        <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
          <Logo />
          <div className="mt-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-accent">
              <InfinityIcon className="h-3.5 w-3.5" />
              Practice Round · {fandom}
            </span>
            <h1 className="font-display mt-6 text-6xl text-foreground">
              {correct}/{total}
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              +{xp} XP earned
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Now Level {level.level} · {level.title}
            </p>
            {exhaustedNotice && (
              <p className="mt-4 text-xs text-accent">
                You've cleared the {fandom} pool — resetting for a fresh cycle.
              </p>
            )}
          </div>
          <button
            onClick={onReplay}
            className="group mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 font-display text-lg text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <RefreshCw className="h-5 w-5" />
            Play Another Round
          </button>
          <Link
            to="/"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-10 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="font-display text-xs uppercase tracking-widest text-accent">
            Practice · Clue {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-6 flex gap-1.5">
          {questions.map((_, i) => (
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
                  stateClass = "border-primary bg-primary/15";
                } else if (isSelected) {
                  stateClass = "border-destructive bg-destructive/15";
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

        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="h-3 w-3 rotate-180" /> Quit practice
        </Link>
      </div>
    </div>
  );
}