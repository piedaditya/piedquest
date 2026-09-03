import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In | Piedquest Cloud Save" },
      {
        name: "description",
        content:
          "Create your free Piedquest account to save your XP, hearts and daily streak to the cloud and keep your progress on every device.",
      },
      { property: "og:title", content: "Sign In | Piedquest Cloud Save" },
      {
        property: "og:description",
        content:
          "Create your free Piedquest account to save your XP, hearts and daily streak to the cloud and keep your progress on every device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, signOut, session, player, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (mode === "signup") {
      setNotice("Account created. If email confirmation is on, check your inbox to finish.");
    }
    void navigate({ to: "/" });
  }

  if (ready && session) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/30 bg-card/60 p-6 text-center shadow-[0_0_40px_-12px_hsl(var(--primary))]">
          <h1 className="text-2xl font-bold text-foreground">Cloud save active</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session.user.email} — {player.xp} XP · {player.streak} day streak · {player.hearts} hearts
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-6 w-full rounded-lg border border-border px-4 py-3 font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-primary/30 bg-card/60 p-6 shadow-[0_0_40px_-12px_hsl(var(--primary))]">
        <h1 className="text-2xl font-bold text-foreground">
          {mode === "signup" ? "Save your quest forever" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your guest XP, hearts and streak move with you — nothing is lost.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-4 w-full text-sm text-muted-foreground underline"
        >
          {mode === "signup" ? "I already have an account" : "Create a new account"}
        </button>
      </div>
    </main>
  );
}
