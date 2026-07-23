import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Home, Infinity as InfinityIcon, RefreshCw, RotateCcw, Zap } from "lucide-react";
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
import { addWrongId, pickReviewQuestion, removeWrongId } from "@/lib/wrong-tracker";
import type { Region } from "@/lib/regional-content";

export const Route = createFileRoute("/practice")({
  component: PracticeRoute,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Custom Quest didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
  notFoundComponent: () => (
    <FullBleed>
      <div className="text-center">
        <h2 className="font-display text-3xl">No custom quest questions</h2>
      </div>
    </FullBleed>
  ),
});

function PracticeRoute() {
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());
  useEffect(() => setStorage(readStorage()), []);
  const fandom = storage.favoriteFandom;
  const region = (storage.region as Region) ?? "Global";
  return (
    <Suspense fallback={<FullBleed><Loader /></FullBleed>}>
      <PracticeContainer
        fandom={fandom}
        region={region}
        onXpEarned={() => setStorage(readStorage())}
        storage={storage}
      />
    </Suspense>
  );
}

function PracticeContainer({
  fandom,
  region,
  onXpEarned,
  storage,
}: {
  fandom: string | null;
  region: Region;
  onXpEarned: () => void;
  storage: QuizStorage;
}) {
  const { data } = useSuspenseQuery(practicePoolQueryOptions(fandom, region));
  const [round, setRound] = useState(0);
  const [justExhausted, setJustExhausted] = useState(false);

  const bucket = `${bucketFor(fandom)}::${region}`;
  const { questions, exhausted, reviewId } = useMemo(() => {
    const pool = data ?? [];
    const seen = getSeen(bucket);
    const { picks, exhausted } = drawFreshRound(pool, seen, 5);
    // Try to inject one previously-missed question if we can find one in the
    // pool that isn't already in this round.
    const pickedIds = new Set(picks.map((p) => p.id));
    const review = pickReviewQuestion(pool, pickedIds);
    let questions = picks;
    let reviewId: string | null = null;
    if (review && picks.length > 0) {
      const slot = Math.floor(Math.random() * picks.length);
      questions = [...picks];
      questions[slot] = review;
      reviewId = review.id;
    }
    return { questions, exhausted, reviewId };
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
      reviewId={reviewId}
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
  reviewId,
  storage,
  onFinish,
  onReplay,
  exhaustedNotice,
}: {
  questions: Question[];
  fandom: string;
  reviewId: string | null;
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
  const isReview = reviewId != null && q.id === reviewId;

  const handlePick = (i: number) => {
    if (locked) return;
    setSelected(i);
    setLocked(true);
    const isCorrect = i === q.correctIndex;
    const nextPattern = [...pattern, isCorrect];
    setPattern(nextPattern);
    // Track wrongs so we can inject as review later; if a review question
    // is answered correctly, retire it from the tracker.
    if (isCorrect) {
      if (isReview) removeWrongId(q.id);
    } else {
      addWrongId(q.id);
    }

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
              Custom Quest · {fandom}
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
            Custom Quest · Clue {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
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
          {isReview && (
            <div
              className="mb-4 flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3"
              style={{ boxShadow: "0 0 24px -10px oklch(0.55 0.22 305 / 0.75)" }}
            >
              <RotateCcw className="h-4 w-4 text-accent" />
              <div className="min-w-0">
                <p className="font-display text-[10px] uppercase tracking-[0.25em] text-accent">
                  Review Challenge
                </p>
                <p className="text-sm text-foreground">
                  🔄 Let's check if you learned from last time!
                </p>
              </div>
            </div>
          )}
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
          <ArrowUpRight className="h-3 w-3 rotate-180" /> Quit quest
        </Link>
      </div>
    </div>
  );
}