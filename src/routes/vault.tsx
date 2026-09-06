import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Loader2, Sparkles, Swords, Target, Trophy, Zap } from "lucide-react";

import { BgGlow, Logo } from "@/lib/quest-ui";
import { useAuth } from "@/contexts/AuthContext";
import TierBadge from "@/components/TierBadge";
import { getMyProfile, listVaultQuests } from "@/lib/social.functions";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Player Vault | Piedquest Stats & Saved Quests" },
      {
        name: "description",
        content:
          "Track your Piedquest win/loss ratio, XP, daily streak and browse the vault of every custom quest you have generated.",
      },
      { property: "og:title", content: "Player Vault | Piedquest Stats & Saved Quests" },
      {
        property: "og:description",
        content:
          "Your personal Piedquest dashboard: win rate, streak, XP level and every saved custom quest in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaultPage,
});

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Zap;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{ background: "var(--color-card)", boxShadow: "0 0 30px -22px var(--primary)" }}
    >
      <p className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="font-display mt-2 text-2xl text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function VaultPage() {
  const { session, player, ready } = useAuth();
  const signedIn = !!session;

  const profileFn = useServerFn(getMyProfile);
  const vaultFn = useServerFn(listVaultQuests);

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => profileFn(),
    enabled: signedIn,
    staleTime: 30_000,
  });

  const vaultQuery = useQuery({
    queryKey: ["vault-quests"],
    queryFn: () => vaultFn(),
    enabled: signedIn,
    staleTime: 30_000,
  });

  const wins = profileQuery.data?.wins ?? 0;
  const losses = profileQuery.data?.losses ?? 0;
  const played = wins + losses;
  const winRate = played ? Math.round((wins / played) * 100) : 0;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-6">
      <BgGlow />
      <div className="relative mx-auto w-full max-w-3xl">
        <Logo />

        <header className="mt-6 flex items-center gap-3">
          <h1 className="font-display text-3xl text-foreground">Player Vault</h1>
          <TierBadge tier={player.activeTier} />
        </header>
        <p className="mt-1 text-sm text-muted-foreground">
          Your lifetime record, streak and every custom quest you've forged.
        </p>

        {!ready ? (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your vault…
          </div>
        ) : !signedIn ? (
          <div className="mt-8 rounded-3xl border border-border p-6 text-center" style={{ background: "var(--color-card)" }}>
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="font-display mt-3 text-lg text-foreground">Sign in to unlock your Vault</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your win/loss record and saved quests live in the cloud so they follow you everywhere.
            </p>
            <Link
              to="/auth"
              className="font-display mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm uppercase tracking-wider text-primary-foreground"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Win rate" value={`${winRate}%`} icon={Target} hint={`${played} rounds played`} />
              <Stat label="Wins" value={String(wins)} icon={Trophy} />
              <Stat label="Losses" value={String(losses)} icon={Swords} />
              <Stat label="Streak" value={`${player.streak}`} icon={Flame} hint="days in a row" />
            </section>

            <section
              className="mt-4 rounded-2xl border border-border p-4"
              style={{ background: "var(--color-card)" }}
            >
              <div className="flex items-center justify-between">
                <p className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" /> Total XP
                </p>
                <p className="font-display text-xl text-primary">{player.xp.toLocaleString()}</p>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, winRate)}%`,
                    background: "linear-gradient(90deg, var(--primary), var(--accent))",
                  }}
                />
              </div>
            </section>

            <h2 className="font-display mt-8 text-lg text-foreground">Quest Vault</h2>
            {vaultQuery.isLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Opening the vault…
              </div>
            ) : (vaultQuery.data?.length ?? 0) === 0 ? (
              <div
                className="mt-4 rounded-2xl border border-border p-5 text-center text-sm text-muted-foreground"
                style={{ background: "var(--color-card)" }}
              >
                Nothing stored yet — generate a quest in{" "}
                <Link to="/my-quests" className="text-primary">
                  My Own Quests
                </Link>{" "}
                and it lands here automatically.
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {(vaultQuery.data ?? []).map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3.5 transition-colors hover:border-primary/40"
                    style={{ background: "var(--color-card)" }}
                  >
                    <span className="text-xl">🗝️</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display truncate text-base text-foreground">{q.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.difficulty} · {q.mode === "typing" ? "Typing" : "Multiple choice"} ·{" "}
                        {q.question_count} questions
                      </p>
                    </div>
                    <span className="font-display shrink-0 text-sm text-primary">
                      {q.total > 0 ? `${q.score}/${q.total}` : "Saved"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
