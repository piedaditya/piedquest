import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Home, Loader2, MessageCircleQuestion, Sparkles, X } from "lucide-react";
import { askQuickQuestion } from "@/lib/quick-qa.functions";
import { BgGlow, FullBleed, Logo } from "@/lib/quest-ui";

export const Route = createFileRoute("/quick-qa")({
  component: QuickQaRoute,
  head: () => ({
    meta: [
      { title: "Quick Q&A | Piedquest Instant AI Answers" },
      {
        name: "description",
        content:
          "Ask anything and get a short, crystal-clear AI answer in seconds with Piedquest Quick Q&A — no fluff, no long paragraphs.",
      },
      { property: "og:title", content: "Quick Q&A | Piedquest Instant AI Answers" },
      {
        property: "og:description",
        content:
          "Type a question, hit Get Answer, and Piedquest returns a concise, insightful explanation instantly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function QuickQaRoute() {
  const ask = useServerFn(askQuickQuestion);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await ask({ data: { question: q } });
      if (res.ok) {
        setAnswer(res.answer);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Couldn't fetch an answer right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setQuestion("");
    setAnswer(null);
    setError(null);
  }

  return (
    <FullBleed>
      <BgGlow />
      <main className="relative mx-auto w-full max-w-2xl px-5 pb-20 pt-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        <section className="mt-10">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            Quick Q&amp;A
          </p>
          <h1 className="font-display mt-2 text-4xl leading-[1.05] text-foreground sm:text-5xl">
            Ask anything.
            <br />
            <span className="text-primary">Get a straight answer.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Short, sharp, and easy to understand — no endless paragraphs.
          </p>
        </section>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-3xl border border-border p-5"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.28 0.15 122 / 0.12), oklch(0.19 0.035 285 / 0.72))",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <label
            htmlFor="quick-qa-input"
            className="font-display text-xs uppercase tracking-[0.25em] text-primary"
          >
            Your question
          </label>
          <textarea
            id="quick-qa-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="e.g. Why does the sky turn red at sunset?"
            className="mt-3 w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading || question.trim().length < 3}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/15 px-5 py-3.5 font-display text-base text-primary transition-all hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: loading ? undefined : "var(--shadow-glow)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking…
                </>
              ) : (
                <>
                  Get Answer
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 font-display text-base text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 grid place-items-center rounded-3xl border border-border/70 p-10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Crafting a concise answer…</p>
          </div>
        )}

        {error && !loading && (
          <p className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
            {error}
          </p>
        )}

        {answer && !loading && (
          <article
            className="mt-8 rounded-3xl border border-primary/30 p-6"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.28 0.15 122 / 0.14), oklch(0.19 0.035 285 / 0.75))",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="font-display text-xs uppercase tracking-[0.25em]">Answer</p>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
              {answer}
            </p>
          </article>
        )}

        {!answer && !loading && !error && (
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircleQuestion className="h-4 w-4 text-accent" />
            Type a question above to get started.
          </p>
        )}
      </main>
    </FullBleed>
  );
}
