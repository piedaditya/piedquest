import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useRef, useState } from "react";
import { AlertTriangle, Lightbulb, ShieldAlert, Timer } from "lucide-react";
import { dailyQuizQueryOptions, type DailyQuiz } from "@/lib/quiz-queries";
import { hasPlayedToday, readStorage, recordCompletion } from "@/lib/quiz-storage";
import { BgGlow, FullBleed, Loader, Logo } from "@/lib/quest-ui";
import { addWrongId } from "@/lib/wrong-tracker";
import { formatMs } from "@/lib/daily-leaderboard";
import {
  TAB_SWITCH_PENALTY_MS,
  useAntiCheat,
  useInteractionLock,
} from "@/lib/anti-cheat";

export const Route = createFileRoute("/quiz")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && hasPlayedToday(readStorage())) {
      throw redirect({ to: "/results", replace: true });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(dailyQuizQueryOptions),
  component: QuizRoute,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Today's challenge didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
});

function QuizRoute() {
  return (
    <Suspense fallback={<FullBleed><Loader /></FullBleed>}>
      <QuizContainer />
    </Suspense>
  );
}

function QuizContainer() {
  const { data } = useSuspenseQuery(dailyQuizQueryOptions);
  const navigate = useNavigate();

  if (!data) {
    return (
      <FullBleed>
        <div className="text-center">
          <h2 className="font-display text-3xl">No challenge today</h2>
          <p className="mt-2 text-sm text-muted-foreground">Come back tomorrow.</p>
        </div>
      </FullBleed>
    );
  }

  return (
    <Playing
      quiz={data}
      onComplete={({ pattern, timeMs, tabSwitches, disqualified }) => {
        const score = disqualified ? 0 : pattern.filter(Boolean).length;
        recordCompletion({
          score,
          pattern,
          quizNumber: data.quizNumber,
          timedOut: false,
          timeMs,
          tabSwitches,
          disqualified,
        });
        navigate({ to: "/results", replace: true });
      }}
    />
  );
}

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  easy: { label: "Easy", color: "var(--primary)" },
  medium: { label: "Medium", color: "oklch(0.8 0.17 85)" },
  hard: { label: "Hard", color: "oklch(0.7 0.2 40)" },
  extreme: { label: "Extreme", color: "var(--destructive)" },
};

function Playing({
  quiz,
  onComplete,
}: {
  quiz: DailyQuiz;
  onComplete: (r: {
    pattern: boolean[];
    timeMs: number;
    tabSwitches: number;
    disqualified: boolean;
  }) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [pattern, setPattern] = useState<boolean[]>([]);
  const [visible, setVisible] = useState(true);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number>(0);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const finishedRef = useRef(false);

  const total = quiz.questions.length;
  const q = quiz.questions[index];
  const tier = TIER_LABEL[q.difficulty ?? "easy"] ?? TIER_LABEL["easy"];

  // High-precision stopwatch: starts the millisecond question 1 mounts.
  if (startRef.current === 0 && typeof performance !== "undefined") {
    startRef.current = performance.now();
  }

  const anti = useAntiCheat(!finished, () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    onComplete({
      pattern: patternRef.current,
      timeMs: performance.now() - startRef.current + TAB_SWITCH_PENALTY_MS,
      tabSwitches: 2,
      disqualified: true,
    });
  });

  useInteractionLock(containerRef, true);

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => {
      setElapsed(performance.now() - startRef.current);
    }, 53);
    return () => clearInterval(id);
  }, [finished]);

  const handlePick = (i: number) => {
    if (locked || finished) return;
    setSelected(i);
    setLocked(true);
    const isCorrect = i === q.correctIndex;
    setPattern((p) => [...p, isCorrect]);
    if (!isCorrect) addWrongId(q.id);
  };

  const handleNext = () => {
    if (finishedRef.current) return;
    const nextPattern = patternRef.current;
    if (index + 1 >= total) {
      finishedRef.current = true;
      setFinished(true);
      onComplete({
        pattern: nextPattern,
        timeMs: performance.now() - startRef.current + anti.penaltyMs,
        tabSwitches: anti.switches,
        disqualified: false,
      });
      return;
    }
    setVisible(false);
    setTimeout(() => {
      setIndex((v) => v + 1);
      setSelected(null);
      setLocked(false);
      setVisible(true);
    }, 220);
  };

  const displayMs = elapsed + anti.penaltyMs;

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      <BgGlow />

      {anti.warning && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 px-6 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-3xl border border-destructive/60 p-6 text-center"
            style={{
              background: "oklch(0.2 0.06 20 / 0.9)",
              boxShadow: "0 0 60px -12px var(--destructive)",
            }}
          >
            <AlertTriangle className="mx-auto h-9 w-9 text-destructive" />
            <h3 className="font-display mt-4 text-2xl text-destructive">
              Anti-Cheat Warning
            </h3>
            <p className="mt-3 text-sm text-foreground">
              Tab switching detected! +10 second penalty applied.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              One more switch and this run is disqualified.
            </p>
            <button
              onClick={anti.dismissWarning}
              className="mt-6 w-full rounded-2xl bg-destructive px-5 py-3 font-display text-sm uppercase tracking-wider text-destructive-foreground"
            >
              I understand
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-10 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="font-display text-xs uppercase tracking-widest text-accent">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-6 flex gap-1">
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
          className="mt-4 flex items-center justify-between rounded-2xl border border-border px-4 py-3"
          style={{
            background: "oklch(0.19 0.035 285 / 0.55)",
            boxShadow: "0 0 26px -18px var(--primary)",
          }}
        >
          <span className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <Timer className="h-3.5 w-3.5" /> Elapsed
          </span>
          <span className="font-display text-lg tabular-nums text-primary">
            {formatMs(displayMs)}
          </span>
        </div>

        {anti.switches > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-destructive">
            <ShieldAlert className="h-3.5 w-3.5" />
            +{anti.switches * 10}s anti-cheat penalty applied
          </p>
        )}

        <div
          className="mt-8 flex-1 transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
          }}
          key={q.id}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-display rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em]"
              style={{ color: tier.color, borderColor: tier.color }}
            >
              {tier.label}
            </span>
            {q.category && (
              <span className="font-display text-xs uppercase tracking-[0.25em] text-accent">
                {q.category}
              </span>
            )}
          </div>

          <h2 className="font-display mt-3 text-3xl leading-tight text-foreground sm:text-4xl">
            {q.question}
          </h2>

          <div className="mt-7 space-y-3">
            {q.choices.map((choice, i) => {
              const isSelected = selected === i;
              const isCorrect = i === q.correctIndex;
              const showState = locked && (isSelected || isCorrect);
              let stateClass =
                "border-border bg-card hover:border-primary/40 hover:bg-primary/5";
              if (showState) {
                stateClass = isCorrect
                  ? "border-primary bg-primary/15"
                  : "border-destructive bg-destructive/15";
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

          {locked && q.explanation && (
            <div
              className="mt-6 rounded-2xl border border-accent/40 p-4"
              style={{ background: "oklch(0.22 0.06 300 / 0.5)" }}
            >
              <p className="inline-flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.25em] text-accent">
                <Lightbulb className="h-3.5 w-3.5" /> Knowledge Nugget
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {q.explanation}
              </p>
            </div>
          )}

          {locked && (
            <button
              onClick={handleNext}
              className="mt-6 w-full rounded-2xl bg-primary px-6 py-4 font-display text-lg text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              {index + 1 >= total ? "Finish Challenge" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
