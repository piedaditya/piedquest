import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowUpRight,
  Check,
  Clock,
  Home,
  Keyboard,
  ListChecks,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { generateMyQuest } from "@/lib/custom-quest.functions";
import type {
  AnswerMode,
  Difficulty,
  GeneratedQuestion,
} from "@/lib/custom-quest.server";
import { shuffleOptions } from "@/lib/shuffle-options";
import { isFuzzyMatch } from "@/lib/fuzzy-match";
import { getLevelInfo, readStorage, recordPractice } from "@/lib/quiz-storage";
import { BgGlow, FullBleed, Logo } from "@/lib/quest-ui";

const DIFFICULTIES: { key: Difficulty; blurb: string }[] = [
  { key: "Easy", blurb: "One-line, simple" },
  { key: "Normal", blurb: "Standard knowledge" },
  { key: "Hard", blurb: "Deep lore / technical" },
  { key: "Extreme", blurb: "Competitive-level" },
];

const PER_QUESTION_TIMERS = [15, 30, 60, 120];
const COUNT_PRESETS = [5, 10, 25, 50, 100, 200];
const BATCH_SIZE = 20;
const SINGLE_CALL_MAX = 25;

const SUGGESTIONS = [
  "Class 12 Bio (Full Syllabus)",
  "NEET Chemistry",
  "Formula 1 History",
  "GTA V Lore",
];

export const Route = createFileRoute("/my-quests")({
  component: MyQuestsRoute,
  head: () => ({
    meta: [
      { title: "My Own Quests | Piedquest AI Quiz Generator" },
      {
        name: "description",
        content:
          "Build a custom AI quiz on any topic with Piedquest — pick your difficulty, timer and answer mode, then let the AI forge 5 fresh questions instantly.",
      },
      { property: "og:title", content: "My Own Quests | Piedquest AI Quiz Generator" },
      {
        property: "og:description",
        content:
          "Type any topic, choose difficulty, timer and typing or multiple-choice mode, and Piedquest AI forges a custom 5-question quest.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <FullBleed>
      <div className="max-w-md text-center">
        <h2 className="font-display text-3xl">My Own Quests didn't load</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </FullBleed>
  ),
});

type Phase = "config" | "loading" | "play";

function MyQuestsRoute() {
  const [phase, setPhase] = useState<Phase>("config");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Normal");
  const [count, setCount] = useState(5);
  const [timerType, setTimerType] = useState<"per" | "total">("per");
  const [seconds, setSeconds] = useState(60);
  const [totalMinutes, setTotalMinutes] = useState(30);
  const [mode, setMode] = useState<AnswerMode>("mcq");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const generate = useServerFn(generateMyQuest);

  const prepare = (list: GeneratedQuestion[]) =>
    mode === "mcq"
      ? list
          .filter((x) => x.choices.length === 4)
          .map((x) => {
            const shuffled = shuffleOptions(x);
            return { ...shuffled, answerText: shuffled.choices[shuffled.correctIndex] };
          })
      : list;

  const launch = async () => {
    const clean = topic.trim();
    if (clean.length < 2) {
      setError("Give your quest a topic first.");
      return;
    }
    const target = Math.max(1, Math.min(200, Math.round(count) || 5));
    setError(null);
    setProgress(0);
    setPhase("loading");
    try {
      const collected: GeneratedQuestion[] = [];
      // <=25 questions is one direct call; anything larger is split into
      // sequential batches so no single response blows the output token cap.
      const batches: number[] = [];
      if (target <= SINGLE_CALL_MAX) batches.push(target);
      else {
        let left = target;
        while (left > 0) {
          batches.push(Math.min(BATCH_SIZE, left));
          left -= BATCH_SIZE;
        }
      }

      for (const size of batches) {
        const { questions: q, notFound, generationError } = await generate({
          data: {
            topic: clean,
            difficulty,
            mode,
            count: size,
            avoid: collected.slice(-40).map((x) => x.question),
          },
        });
        if (generationError) {
          setError(
            collected.length
              ? `${generationError} ${collected.length} of ${target} questions were prepared; retry to forge a complete quest.`
              : generationError,
          );
          setPhase("config");
          return;
        }
        if (notFound && !collected.length) {
          setError(
            "Sorry, I searched the entire multiverse and couldn't find that! But try your best with another topic.",
          );
          setPhase("config");
          return;
        }
        collected.push(...q);
        setProgress(Math.min(target, collected.length));
      }

      const usable = prepare(collected).slice(0, target);
      if (!usable.length)
        throw new Error("The AI returned no usable questions — try rephrasing your topic.");
      setQuestions(usable);
      setPhase("play");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setPhase("config");
    }
  };

  if (phase === "loading")
    return (
      <BoomLoader
        topic={topic}
        difficulty={difficulty}
        done={progress}
        target={Math.max(1, Math.min(200, Math.round(count) || 5))}
      />
    );

  if (phase === "play")
    return (
      <QuestPlayer
        questions={questions}
        mode={mode}
        seconds={timerType === "per" ? seconds : 0}
        totalSeconds={timerType === "total" ? Math.max(0, totalMinutes) * 60 : 0}
        topic={topic.trim()}
        onExit={() => setPhase("config")}
        onReplay={() => void launch()}
      />
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>

        <div className="mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-display text-[11px] uppercase tracking-[0.25em] text-accent">
            <Wand2 className="h-3.5 w-3.5" /> My Own Quests
          </span>
          <h1 className="font-display mt-5 text-4xl leading-[1.05] text-foreground sm:text-5xl">
            Command the AI. <span className="text-primary">Build any exam.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            From game lore to a full Class 12 syllabus — up to 200 questions with the
            timer style you want.
          </p>
        </div>

        {/* Topic */}
        <Section label="Topic or Full Syllabus" icon={<Sparkles className="h-3.5 w-3.5" />}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={200}
            placeholder="e.g., Class 12 Bio (Full Syllabus), JEE Main Physics, GTA V Lore, Python Basics..."
            className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60"
            style={{ boxShadow: "0 0 40px -24px var(--primary)" }}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </Section>

        {/* Question count */}
        <Section label="Number of questions" icon={<ListChecks className="h-3.5 w-3.5" />}>
          <div className="flex flex-wrap gap-2">
            {COUNT_PRESETS.map((n) => {
              const active = count === n;
              return (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`font-display min-w-14 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                  style={active ? { boxShadow: "0 0 30px -14px var(--primary)" } : undefined}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <label className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <span className="text-xs text-muted-foreground">Custom (1–200)</span>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCount(Number.isNaN(v) ? 1 : Math.max(1, Math.min(200, Math.round(v))));
              }}
              className="font-display w-24 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-primary/60"
            />
          </label>
          {count > SINGLE_CALL_MAX && (
            <p className="mt-2 text-xs text-muted-foreground">
              Large bank — generated in {Math.ceil(count / BATCH_SIZE)} fast batches.
            </p>
          )}
        </Section>

        {/* Difficulty */}
        <Section label="Difficulty" icon={<Zap className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setDifficulty(d.key)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                  style={active ? { boxShadow: "0 0 34px -14px var(--primary)" } : undefined}
                >
                  <p className={`font-display text-base ${active ? "text-primary" : "text-foreground"}`}>
                    {d.key}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{d.blurb}</p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Timer */}
        <Section label="Timer" icon={<Clock className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1.5">
            {(["per", "total"] as const).map((t) => {
              const active = timerType === t;
              return (
                <button
                  key={t}
                  onClick={() => setTimerType(t)}
                  className={`font-display rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "per" ? "Per-Question" : "Total Exam"}
                </button>
              );
            })}
          </div>

          {timerType === "per" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {PER_QUESTION_TIMERS.map((s) => {
                const active = seconds === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeconds(s)}
                    className={`font-display rounded-xl border px-4 py-2.5 text-sm transition-all ${
                      active
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-card text-foreground hover:border-accent/40"
                    }`}
                  >
                    {s}s
                  </button>
                );
              })}
              <button
                onClick={() => setSeconds(0)}
                className={`font-display rounded-xl border px-4 py-2.5 text-sm transition-all ${
                  seconds === 0
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-foreground hover:border-accent/40"
                }`}
              >
                No timer
              </button>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <input
                type="number"
                min={0}
                max={200}
                value={totalMinutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTotalMinutes(Number.isNaN(v) ? 0 : Math.max(0, Math.min(200, Math.round(v))));
                }}
                className="font-display w-24 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus:border-accent/60"
              />
              <span className="text-xs text-muted-foreground">
                minutes total {totalMinutes === 0 ? "(no timer)" : "· 1–200"}
              </span>
            </div>
          )}
        </Section>

        {/* Answer mode */}
        <Section label="Answer mode" icon={<ListChecks className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-3">
            <ModeCard
              active={mode === "mcq"}
              onClick={() => setMode("mcq")}
              icon={<ListChecks className="h-4 w-4" />}
              title="Multiple Choice"
              blurb="Classic 4 options"
            />
            <ModeCard
              active={mode === "typing"}
              onClick={() => setMode("typing")}
              icon={<Keyboard className="h-4 w-4" />}
              title="Typing Mode"
              blurb="Type it — typos forgiven"
            />
          </div>
        </Section>

        {error && (
          <p className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          onClick={() => void launch()}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 font-display text-lg text-primary-foreground transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <Wand2 className="h-5 w-5" />
          Generate Quest · {count} Q
        </button>
      </div>
    </div>
  );
}

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <p className="font-display mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  blurb,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  blurb: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/40"
      }`}
      style={active ? { boxShadow: "0 0 34px -14px oklch(0.55 0.22 305)" } : undefined}
    >
      <span className={active ? "text-accent" : "text-muted-foreground"}>{icon}</span>
      <p className={`font-display mt-2 text-base ${active ? "text-accent" : "text-foreground"}`}>
        {title}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>
    </button>
  );
}

function BoomLoader({
  topic,
  difficulty,
  done,
  target,
}: {
  topic: string;
  difficulty: Difficulty;
  done: number;
  target: number;
}) {
  const pct = Math.max(4, Math.min(100, (done / Math.max(1, target)) * 100));
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col px-5 pb-10 pt-8">
        <Logo />
        <div className="mt-20 text-center">
          <h2
            className="font-display animate-pulse text-6xl tracking-tight text-primary sm:text-7xl"
            style={{ textShadow: "0 0 42px oklch(0.92 0.22 122 / 0.75)" }}
          >
            BOOOM!
          </h2>
          <p className="font-display mt-4 text-2xl text-foreground">
            Forging Question Bank… [{done}/{target} Generated]
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {difficulty} · {topic.trim() || "your topic"}
          </p>
        </div>
        <div className="mt-10 h-3 w-full overflow-hidden rounded-full border border-primary/25 bg-primary/5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--primary)", boxShadow: "0 0 18px var(--primary)" }}
          />
        </div>
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-primary/25 bg-primary/5"
              style={{ animationDelay: `${i * 130}ms`, boxShadow: "0 0 28px -14px var(--primary)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestPlayer({
  questions,
  mode,
  seconds,
  totalSeconds,
  topic,
  onExit,
  onReplay,
}: {
  questions: GeneratedQuestion[];
  mode: AnswerMode;
  seconds: number;
  totalSeconds: number;
  topic: string;
  onExit: () => void;
  onReplay: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [locked, setLocked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [pattern, setPattern] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(seconds);
  const [examLeft, setExamLeft] = useState(totalSeconds);
  const inputRef = useRef<HTMLInputElement>(null);

  const total = questions.length;
  const q = questions[index];

  const advance = useCallback(
    (correct: boolean) => {
      setLocked(true);
      setWasCorrect(correct);
      const next = [...pattern, correct];
      setPattern(next);
      setTimeout(() => {
        if (index + 1 >= total) {
          recordPractice(next.filter(Boolean).length);
          setDone(true);
        } else {
          setIndex(index + 1);
          setSelected(null);
          setTyped("");
          setLocked(false);
          setLeft(seconds);
        }
      }, 2400);
    },
    [index, pattern, seconds, total],
  );

  // Per-question countdown.
  useEffect(() => {
    if (!seconds || locked || done) return;
    if (left <= 0) {
      advance(false);
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, seconds, locked, done, advance]);

  // Total exam countdown — ends the whole test at zero.
  useEffect(() => {
    if (!totalSeconds || done) return;
    if (examLeft <= 0) {
      recordPractice(pattern.filter(Boolean).length);
      setDone(true);
      return;
    }
    const t = setTimeout(() => setExamLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [examLeft, totalSeconds, done, pattern]);

  useEffect(() => {
    if (mode === "typing" && !locked) inputRef.current?.focus();
  }, [index, mode, locked]);

  const timePct = useMemo(
    () => (seconds ? Math.max(0, Math.min(100, (left / seconds) * 100)) : 100),
    [left, seconds],
  );

  if (done) {
    const correct = pattern.filter(Boolean).length;
    const xp = correct * 10;
    const level = getLevelInfo(readStorage().xp);
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <BgGlow />
        <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
          <Logo />
          <div className="mt-14 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-accent">
              <Wand2 className="h-3.5 w-3.5" /> {topic}
            </span>
            <h1 className="font-display mt-6 text-6xl text-foreground">
              {correct}/{total}
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" /> +{xp} XP earned
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Level {level.level} · {level.title}
            </p>
          </div>
          <button
            onClick={onReplay}
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-5 font-display text-lg text-primary-foreground transition-all hover:scale-[1.01]"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <RefreshCw className="h-5 w-5" /> Forge Another Quest
          </button>
          <button
            onClick={onExit}
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-primary/40"
          >
            <Wand2 className="h-5 w-5" /> Change Settings
          </button>
          <Link
            to="/"
            className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-accent/40"
          >
            <Home className="h-5 w-5" /> Back to Home
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
            Clue {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-6 flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  i < index ? "var(--primary)" : i === index ? "oklch(0.55 0.22 305)" : "var(--border)",
              }}
            />
          ))}
        </div>

        {seconds > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Time
              </span>
              <span className={left <= 5 ? "text-destructive" : "text-primary"}>{left}s</span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${timePct}%`,
                  background: left <= 5 ? "var(--destructive)" : "var(--primary)",
                }}
              />
            </div>
          </div>
        )}

        {totalSeconds > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Exam time left
              </span>
              <span className={examLeft <= 30 ? "text-destructive" : "text-accent"}>
                {Math.floor(examLeft / 60)}:{String(examLeft % 60).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(100, (examLeft / totalSeconds) * 100))}%`,
                  background: examLeft <= 30 ? "var(--destructive)" : "oklch(0.55 0.22 305)",
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex-1" key={index}>
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
            {topic}
            <span className="ml-2 inline-flex items-center gap-1 text-primary">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          </p>
          <h2 className="font-display mt-3 text-3xl leading-tight text-foreground sm:text-4xl">
            {q.question}
          </h2>

          {mode === "mcq" ? (
            <div className="mt-8 space-y-3">
              {q.choices.map((choice, i) => {
                const isSelected = selected === i;
                const isCorrect = i === q.correctIndex;
                const show = locked && (isSelected || isCorrect);
                let cls = "border-border bg-card hover:border-primary/40 hover:bg-primary/5";
                if (show) cls = isCorrect ? "border-primary bg-primary/15" : "border-destructive bg-destructive/15";
                return (
                  <button
                    key={i}
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setSelected(i);
                      advance(i === q.correctIndex);
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${cls} disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm ${
                        show && isCorrect
                          ? "bg-primary text-primary-foreground"
                          : show && isSelected
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-secondary text-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-base font-medium text-foreground">{choice}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (locked || !typed.trim()) return;
                advance(isFuzzyMatch(typed, q.acceptable));
              }}
            >
              <input
                ref={inputRef}
                value={typed}
                disabled={locked}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type your answer…"
                className={`w-full rounded-2xl border bg-card px-4 py-5 text-lg text-foreground outline-none transition-all placeholder:text-muted-foreground ${
                  locked
                    ? wasCorrect
                      ? "border-primary"
                      : "border-destructive"
                    : "border-border focus:border-primary/60"
                }`}
              />
              {!locked ? (
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-base text-primary-foreground transition-all hover:scale-[1.01]"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                >
                  <Check className="h-4 w-4" /> Lock Answer
                </button>
              ) : (
                <p
                  className={`mt-4 flex items-center gap-2 font-display text-base ${
                    wasCorrect ? "text-primary" : "text-destructive"
                  }`}
                >
                  {wasCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {wasCorrect ? "Correct!" : `Answer: ${q.answerText}`}
                </p>
              )}
            </form>
          )}

          {locked && q.explanation && (
            <div
              className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
              style={{ boxShadow: "0 0 30px -18px var(--primary)" }}
            >
              <p className="font-display text-[10px] uppercase tracking-[0.25em] text-primary">Why</p>
              <p className="mt-1 text-sm text-foreground">{q.explanation}</p>
            </div>
          )}
        </div>

        <button
          onClick={onExit}
          className="mt-6 inline-flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="h-3 w-3 rotate-180" /> Quit quest
        </button>
      </div>
    </div>
  );
}
