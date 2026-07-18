import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import {
  dailyQuizQueryOptions,
  type DailyQuiz,
} from "@/lib/quiz-queries";
import { hasPlayedToday, readStorage, recordCompletion } from "@/lib/quiz-storage";
import { BgGlow, FullBleed, Loader, Logo } from "@/lib/quest-ui";

export const Route = createFileRoute("/quiz")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && hasPlayedToday(readStorage())) {
      throw redirect({ to: "/results", replace: true });
    }
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dailyQuizQueryOptions),
  component: QuizRoute,
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">Today's quest didn't load</h2>
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
          <h2 className="font-display text-3xl">No quest today</h2>
          <p className="mt-2 text-sm text-muted-foreground">Come back tomorrow.</p>
        </div>
      </FullBleed>
    );
  }

  return (
    <Playing
      quiz={data}
      onComplete={(pattern) => {
        const score = pattern.filter(Boolean).length;
        recordCompletion({
          score,
          pattern,
          quizNumber: data.quizNumber,
        });
        // replace: back from /results goes to / (Landing), not back into the quiz
        navigate({ to: "/results", replace: true });
      }}
    />
  );
}

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