import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Copy, Loader2, LogOut, Plus, Users, Zap } from "lucide-react";

import { BgGlow, Logo } from "@/lib/quest-ui";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/TierBadge";
import {
  createLeague,
  getLeagueBoard,
  getMyLeagues,
  joinLeague,
  leaveLeague,
} from "@/lib/social.functions";

export const Route = createFileRoute("/leagues")({
  head: () => ({
    meta: [
      { title: "Friend Leagues | Private Piedquest Leaderboards" },
      {
        name: "description",
        content:
          "Create a private Piedquest league with a 6-digit invite code and battle your friends on an isolated XP leaderboard.",
      },
      { property: "og:title", content: "Friend Leagues | Private Piedquest Leaderboards" },
      {
        property: "og:description",
        content:
          "Share a 6-digit invite code and compete with friends only on your own private Piedquest leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LeaguesPage,
});

function LeaguesPage() {
  const { session, player, ready } = useAuth();
  const signedIn = !!session;
  const isSpecial = player.activeTier === "special";
  const qc = useQueryClient();

  const myLeaguesFn = useServerFn(getMyLeagues);
  const boardFn = useServerFn(getLeagueBoard);
  const createFn = useServerFn(createLeague);
  const joinFn = useServerFn(joinLeague);
  const leaveFn = useServerFn(leaveLeague);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const leaguesQuery = useQuery({
    queryKey: ["my-leagues"],
    queryFn: () => myLeaguesFn(),
    enabled: signedIn,
    staleTime: 20_000,
  });

  const leagues = leaguesQuery.data ?? [];

  useEffect(() => {
    if (!selected && leagues.length) setSelected(leagues[0]!.id);
  }, [leagues, selected]);

  const boardQuery = useQuery({
    queryKey: ["league-board", selected],
    queryFn: () => boardFn({ data: { leagueId: selected! } }),
    enabled: signedIn && !!selected,
    refetchInterval: 20_000,
  });

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const res = await createFn({ data: { name } });
    setBusy(false);
    if (res.error) return setError(res.error);
    setName("");
    void qc.invalidateQueries({ queryKey: ["my-leagues"] });
  }

  async function handleJoin() {
    setBusy(true);
    setError(null);
    const res = await joinFn({ data: { code } });
    setBusy(false);
    if (res.error) return setError(res.error);
    setCode("");
    setSelected(res.league?.id ?? null);
    void qc.invalidateQueries({ queryKey: ["my-leagues"] });
  }

  async function handleLeave(leagueId: string) {
    await leaveFn({ data: { leagueId } });
    setSelected(null);
    void qc.invalidateQueries({ queryKey: ["my-leagues"] });
  }

  function copyCode(value: string) {
    void navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-6">
      <BgGlow />
      <div className="relative mx-auto w-full max-w-3xl">
        <Logo />

        <h1 className="font-display mt-6 text-3xl text-foreground">Friend Leagues</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private, isolated leaderboards. Special tier players open a league; anyone can join with the code.
        </p>

        {!ready ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !signedIn ? (
          <div
            className="mt-8 rounded-3xl border border-border p-6 text-center"
            style={{ background: "var(--color-card)" }}
          >
            <Users className="mx-auto h-6 w-6 text-primary" />
            <p className="font-display mt-3 text-lg text-foreground">Sign in to play with friends</p>
            <Link
              to="/auth"
              className="font-display mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm uppercase tracking-wider text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-2xl border border-border p-4"
                style={{ background: "var(--color-card)" }}
              >
                <p className="font-display inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" /> Create a league
                </p>
                <input
                  value={name}
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="League name"
                  className="mt-3 w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  disabled={busy || !isSpecial}
                  onClick={handleCreate}
                  className="font-display mt-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm uppercase tracking-wider text-primary-foreground transition-transform hover:scale-[1.01] disabled:opacity-40"
                >
                  {busy ? "Working…" : "Generate invite code"}
                </button>
                {!isSpecial && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TierBadge tier="special" /> Special tier perk
                  </p>
                )}
              </div>

              <div
                className="rounded-2xl border border-border p-4"
                style={{ background: "var(--color-card)" }}
              >
                <p className="font-display inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Join with a code
                </p>
                <input
                  value={code}
                  maxLength={6}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="font-display mt-3 w-full rounded-xl border border-border bg-input px-3 py-2.5 text-center text-lg tracking-[0.4em] text-foreground outline-none focus:border-primary"
                />
                <button
                  disabled={busy || code.length !== 6}
                  onClick={handleJoin}
                  className="font-display mt-3 w-full rounded-xl border border-primary/50 bg-primary/15 px-4 py-2.5 text-sm uppercase tracking-wider text-primary disabled:opacity-40"
                >
                  Join league
                </button>
              </div>
            </section>

            {error && (
              <p className="mt-3 rounded-xl border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {leagues.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {leagues.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    className={`font-display rounded-full border px-3.5 py-2 text-xs uppercase tracking-wider transition-colors ${
                      selected === l.id
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {l.name} · {l.member_count}
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <section className="mt-5">
                {(() => {
                  const league = leagues.find((l) => l.id === selected);
                  if (!league) return null;
                  return (
                    <div
                      className="flex items-center gap-3 rounded-2xl border border-border p-4"
                      style={{ background: "var(--color-card)" }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-display truncate text-base text-foreground">{league.name}</p>
                        <p className="font-display text-xs tracking-[0.3em] text-primary">{league.code}</p>
                      </div>
                      <button
                        onClick={() => copyCode(league.code)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copied === league.code ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copied === league.code ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleLeave(league.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Leave
                      </button>
                    </div>
                  );
                })()}

                {boardQuery.isLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading standings…
                  </div>
                ) : (
                  <ol className="mt-4 space-y-2">
                    {(boardQuery.data ?? []).map((p, i) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 rounded-2xl border border-border p-3.5"
                        style={{ background: "var(--color-card)" }}
                      >
                        <span className="font-display grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-sm text-muted-foreground">
                          {i + 1}
                        </span>
                        <p className="font-display flex min-w-0 flex-1 items-center gap-2 truncate text-base text-foreground">
                          @{p.username}
                          <TierBadge tier={p.tier} />
                        </p>
                        <span className="font-display inline-flex items-center gap-1 text-sm text-primary">
                          <Zap className="h-3.5 w-3.5" />
                          {p.xp.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
