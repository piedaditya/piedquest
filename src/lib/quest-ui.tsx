import { Flame } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { msUntilMidnight } from "./quiz-storage";

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