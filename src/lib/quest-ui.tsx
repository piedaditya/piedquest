import { Clock, Flame } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { msUntilMidnight } from "./quiz-storage";

/**
 * Counts down `total` seconds for one quest round. Restarts whenever
 * `resetKey` changes so a brand-new round always begins at full time.
 */
export function useRoundTimer(
  total: number,
  onExpire: () => void,
  active: boolean,
  resetKey: unknown = 0,
): number {
  const [left, setLeft] = useState(total);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    setLeft(total);
  }, [total, resetKey]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          expireRef.current();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, total, resetKey]);

  return left;
}

export function QuestTimer({ left, total }: { left: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (left / total) * 100));
  const urgent = left <= 10;
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 transition-colors ${
        urgent ? "animate-pulse border-destructive/60" : "border-border"
      }`}
      style={{
        background: urgent
          ? "oklch(0.45 0.2 25 / 0.12)"
          : "oklch(0.19 0.035 285 / 0.5)",
        boxShadow: urgent
          ? "0 0 34px -8px var(--destructive)"
          : "0 0 26px -18px var(--primary)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> Round time
        </span>
        <span
          className={`font-display text-lg tabular-nums ${urgent ? "text-destructive" : "text-primary"}`}
          style={urgent ? { textShadow: "0 0 18px var(--destructive)" } : undefined}
        >
          0:{String(Math.max(0, left)).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background: urgent ? "var(--destructive)" : "var(--primary)",
            boxShadow: urgent ? "0 0 16px var(--destructive)" : "0 0 12px var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

export function FullBleed({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10">
      <BgGlow />
      <div className="relative z-10 flex w-full max-w-lg items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function BgGlow() {
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

export function Loader() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      <p className="text-sm">Loading today's quest…</p>
    </div>
  );
}

export function Logo() {
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

export function LivePill({ quizNumber }: { quizNumber: number }) {
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

export function StreakPill({ streak }: { streak: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-display text-xs uppercase tracking-wider text-primary">
      <Flame className="h-3.5 w-3.5" />
      {streak} Day Streak
    </span>
  );
}

export function NextQuestCountdown() {
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
    <div
      className="mt-8 rounded-3xl border border-border p-6 text-center"
      style={{ background: "oklch(0.19 0.035 285 / 0.6)" }}
    >
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