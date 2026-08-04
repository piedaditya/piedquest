import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Crown, Flame, Home, Loader2, Pencil, ShieldAlert, Trophy, Zap } from "lucide-react";
import { BgGlow, Logo } from "@/lib/quest-ui";
import { getLevelInfo, readStorage, type QuizStorage } from "@/lib/quiz-storage";
import {
  fetchTopByStreak,
  fetchTopLeaderboard,
  getClientId,
  getUsername,
  setUsername,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchDailyTop,
  fetchMyDailyRun,
  formatMs,
  type DailyRunRow,
} from "@/lib/daily-leaderboard";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardRoute,
});

const AVATARS = ["🐉", "📜", "🎮", "🦉", "🎧", "⭐", "🥷", "🛡️", "🦊", "🍿", "🌱", "☕", "🎤", "📺", "🗝️"];
function avatarFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATARS[Math.abs(h) % AVATARS.length];
}

function LeaderboardRoute() {
  const [tab, setTab] = useState<"daily" | "xp" | "streak">("daily");
  const [storage, setStorage] = useState<QuizStorage>(() => readStorage());
  const [clientId, setClientId] = useState("");
  const [username, setLocalName] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setStorage(readStorage());
    setClientId(getClientId());
    setLocalName(getUsername());
  }, []);

  const level = getLevelInfo(storage.xp);

  const query = useQuery<LeaderboardRow[]>({
    queryKey: ["leaderboard", tab],
    queryFn: () => (tab === "xp" ? fetchTopLeaderboard(10) : fetchTopByStreak(10)),
    refetchInterval: 15_000,
    enabled: tab !== "daily",
  });

  const dailyQuery = useQuery<DailyRunRow[]>({
    queryKey: ["daily-leaderboard"],
    queryFn: () => fetchDailyTop(),
    refetchInterval: 15_000,
    enabled: tab === "daily",
  });

  const myRunQuery = useQuery<DailyRunRow | null>({
    queryKey: ["daily-leaderboard-me", clientId],
    queryFn: () => fetchMyDailyRun(),
    enabled: tab === "daily" && !!clientId,
  });

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => query.refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = query.data ?? [];
  const dailyRows = dailyQuery.data ?? [];
  const myRun = myRunQuery.data ?? null;
  const myDailyRank = dailyRows.findIndex((r) => r.user_id === clientId);
  const myRank = rows.findIndex((r) => r.client_id === clientId);

  const commitName = () => {
    const next = setUsername(username);
    setLocalName(next);
    setEditing(false);
    // Reflect immediately if user is already on the board.
    query.refetch();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BgGlow />
      <div className="relative z-10 mx-auto max-w-xl px-5 pb-16 pt-8">
        <Logo />

        <section className="mt-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-display text-xs uppercase tracking-widest text-primary">
            <Trophy className="h-3.5 w-3.5" />
            Global Leaderboard · Live
          </span>
          <h1 className="font-display mt-5 text-5xl text-foreground">
            Top of the fandom.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Real players, real streaks. Updated the moment someone finishes a quest.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1">
          <TabBtn active={tab === "daily"} onClick={() => setTab("daily")}>
            Daily
          </TabBtn>
          <TabBtn active={tab === "xp"} onClick={() => setTab("xp")}>
            Top XP
          </TabBtn>
          <TabBtn active={tab === "streak"} onClick={() => setTab("streak")}>
            Streak
          </TabBtn>
        </div>

        {tab === "daily" ? (
          <DailyBoard
            rows={dailyRows}
            loading={dailyQuery.isLoading}
            clientId={clientId}
            myRun={myRun}
            myRank={myDailyRank}
          />
        ) : query.isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading live standings…
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No entries yet — finish today's quest to plant your flag.
          </div>
        ) : (
          <ol className="mt-6 space-y-2">
            {rows.map((p, i) => {
              const isMe = p.client_id === clientId;
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                    isMe ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                  style={{
                    background:
                      i === 0
                        ? "linear-gradient(90deg, oklch(0.28 0.15 122 / 0.25), oklch(0.19 0.035 285 / 0.6))"
                        : isMe
                          ? "linear-gradient(90deg, oklch(0.28 0.15 122 / 0.15), oklch(0.19 0.035 285 / 0.6))"
                          : "oklch(0.19 0.035 285 / 0.6)",
                  }}
                >
                  <span
                    className={`font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm ${
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : i < 3
                          ? "bg-accent/30 text-accent"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="text-2xl">{avatarFor(p.client_id)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate text-base text-foreground">
                      @{p.username}
                      {isMe && (
                        <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Best score {p.score}/5
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 font-display text-sm text-primary">
                      <Flame className="h-3.5 w-3.5" />
                      {p.streak}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      {p.xp.toLocaleString()}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <section
          className="mt-8 rounded-3xl border border-border p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.06 300 / 0.55), oklch(0.19 0.035 285 / 0.7))",
          }}
        >
          <p className="font-display text-xs uppercase tracking-[0.25em] text-accent">
            Your rank
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="grid h-11 w-11 place-items-center rounded-xl font-display text-lg text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.22 122), oklch(0.55 0.22 305))",
              }}
            >
              {level.level}
            </div>
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={username}
                    maxLength={32}
                    onChange={(e) => setLocalName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && commitName()}
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-display text-sm text-foreground outline-none focus:border-primary"
                  />
                  <button
                    onClick={commitName}
                    className="rounded-lg bg-primary px-3 py-1.5 font-display text-xs uppercase tracking-wider text-primary-foreground"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="group inline-flex items-center gap-2 text-left"
                >
                  <span className="font-display text-base text-foreground">
                    @{username || "Player"} · {level.title}
                  </span>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {(tab === "daily" ? myDailyRank : myRank) >= 0
                  ? `Ranked #${(tab === "daily" ? myDailyRank : myRank) + 1} on this board`
                  : "Play today's challenge to enter the board"}
                {" · "}
                {level.totalXp} XP
              </p>
            </div>
          </div>
        </section>

        <Link
          to="/"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-5 font-display text-lg text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 font-display text-sm uppercase tracking-wider transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      style={active ? { boxShadow: "0 0 20px -8px oklch(0.92 0.22 122 / 0.6)" } : undefined}
    >
      {children}
    </button>
  );
}

function DailyBoard({
  rows,
  loading,
  clientId,
  myRun,
  myRank,
}: {
  rows: DailyRunRow[];
  loading: boolean;
  clientId: string;
  myRun: DailyRunRow | null;
  myRank: number;
}) {
  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading today's global standings…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No runs today yet — finish the Global Daily Challenge to claim rank #1.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-[2.2rem_1fr_3rem_5.5rem] gap-2 px-3 pb-2 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Score</span>
        <span className="text-right">Time</span>
      </div>
      <ol className="space-y-1.5">
        {rows.map((r, i) => (
          <DailyRow key={r.id} row={r} rank={i + 1} isMe={r.user_id === clientId} />
        ))}
      </ol>

      {myRun && myRank < 0 && (
        <div className="mt-4">
          <p className="px-3 pb-2 font-display text-[10px] uppercase tracking-[0.2em] text-accent">
            Your run
          </p>
          <DailyRow row={myRun} rank={null} isMe />
        </div>
      )}
    </div>
  );
}

function DailyRow({
  row,
  rank,
  isMe,
}: {
  row: DailyRunRow;
  rank: number | null;
  isMe: boolean;
}) {
  return (
    <li
      className={`grid grid-cols-[2.2rem_1fr_3rem_5.5rem] items-center gap-2 rounded-xl border px-3 py-2.5 ${
        isMe ? "border-primary" : "border-border"
      }`}
      style={{
        background:
          rank === 1
            ? "linear-gradient(90deg, oklch(0.28 0.15 122 / 0.25), oklch(0.19 0.035 285 / 0.6))"
            : isMe
              ? "linear-gradient(90deg, oklch(0.28 0.15 122 / 0.15), oklch(0.19 0.035 285 / 0.6))"
              : "oklch(0.19 0.035 285 / 0.55)",
      }}
    >
      <span className="font-display text-sm text-muted-foreground">
        {rank === 1 ? <Crown className="h-4 w-4 text-primary" /> : (rank ?? "—")}
      </span>
      <span className="min-w-0">
        <span className="font-display block truncate text-sm text-foreground">
          @{row.username}
          {isMe && (
            <span className="ml-2 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-primary">
              You
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          {row.disqualified ? (
            <span className="inline-flex items-center gap-1 text-destructive">
              <ShieldAlert className="h-3 w-3" /> Disqualified
            </span>
          ) : row.tab_switches > 0 ? (
            <span className="text-accent">+10s penalty</span>
          ) : (
            <span className="text-primary">Clean run</span>
          )}
        </span>
      </span>
      <span className="text-right font-display text-sm tabular-nums text-primary">
        {row.score}/15
      </span>
      <span className="text-right font-display text-sm tabular-nums text-foreground">
        {formatMs(row.time_ms)}
      </span>
    </li>
  );
}
