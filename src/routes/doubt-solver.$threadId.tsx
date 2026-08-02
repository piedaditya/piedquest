import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Home, Plus, Send, Sparkles, Trash2, MessagesSquare } from "lucide-react";
import { TutorMarkdown } from "@/components/tutor-markdown";
import {
  cloudCreateThread,
  cloudDeleteThread,
  cloudLoadThreads,
  cloudRenameThread,
  cloudSaveMessage,
  mergeThreads,
  newId,
  readThreads,
  titleFrom,
  writeThreads,
  type DoubtThread,
} from "@/lib/doubt-store";

export const Route = createFileRoute("/doubt-solver/$threadId")({
  ssr: false,
  component: DoubtSolver,
  head: () => ({
    meta: [
      { title: "The Doubt Solver | Piedquest AI Tutor" },
      {
        name: "description",
        content:
          "Chat with Piedquest's AI tutor — clear, funny, visual explanations for physics, math, biology and coding doubts.",
      },
      { property: "og:title", content: "The Doubt Solver | Piedquest AI Tutor" },
      {
        property: "og:description",
        content:
          "Chat with Piedquest's AI tutor for mind-blowing explanations with real-life examples and diagrams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const STARTERS = [
  "Explain electric dielectrics like I'm 12",
  "Why does a photon have momentum but no mass?",
  "Draw me a flowchart of photosynthesis",
  "Explain Python decorators with a funny example",
];

function textOf(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

function DoubtSolver() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<DoubtThread[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [drawer, setDrawer] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<Set<string>>(new Set());

  // Bootstrap: local first (instant), then merge cloud copy.
  useEffect(() => {
    const local = readThreads();
    const withCurrent = local.some((t) => t.id === threadId)
      ? local
      : [{ id: threadId, title: "New doubt", updatedAt: Date.now(), messages: [] }, ...local];
    setThreads(writeThreads(withCurrent));
    setReady(true);
    void cloudLoadThreads().then((remote) => {
      if (remote.length) setThreads((cur) => writeThreads(mergeThreads(cur, remote)));
    });
  }, [threadId]);

  const active = useMemo(
    () => threads.find((t) => t.id === threadId),
    [threads, threadId],
  );

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      (active?.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.text }],
      })) as UIMessage[],
    // Only seed once per thread — streaming owns messages after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threadId, ready],
  );

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/doubt-chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const persist = useCallback(
    (msgs: UIMessage[]) => {
      setThreads((cur) => {
        const next = cur.map((t) =>
          t.id === threadId
            ? {
                ...t,
                updatedAt: Date.now(),
                title:
                  t.title === "New doubt" && msgs[0]
                    ? titleFrom(textOf(msgs[0]))
                    : t.title,
                messages: msgs.map((m) => ({
                  id: m.id,
                  role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
                  text: textOf(m),
                })),
              }
            : t,
        );
        return writeThreads(next);
      });
    },
    [threadId],
  );

  // Mirror finished messages to local + cloud.
  useEffect(() => {
    if (!ready || !messages.length) return;
    persist(messages);
    if (status === "streaming" || status === "submitted") return;
    for (const m of messages) {
      if (savedRef.current.has(m.id)) continue;
      const text = textOf(m);
      if (!text) continue;
      savedRef.current.add(m.id);
      void cloudSaveMessage(threadId, m.role === "assistant" ? "assistant" : "user", text);
    }
    const first = textOf(messages[0]);
    if (first) void cloudRenameThread(threadId, titleFrom(first));
  }, [messages, status, ready, persist, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (status !== "streaming") inputRef.current?.focus();
  }, [status, threadId]);

  const busy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    if (!messages.length) void cloudCreateThread(threadId, titleFrom(clean));
    setInput("");
    void sendMessage({ text: clean });
  };

  const startThread = () => {
    const id = newId();
    setThreads((cur) =>
      writeThreads([{ id, title: "New doubt", updatedAt: Date.now(), messages: [] }, ...cur]),
    );
    setDrawer(false);
    void navigate({ to: "/doubt-solver/$threadId", params: { threadId: id } });
  };

  const removeThread = (id: string) => {
    const next = writeThreads(threads.filter((t) => t.id !== id));
    setThreads(next);
    void cloudDeleteThread(id);
    if (id === threadId) {
      const target = next[0]?.id ?? newId();
      void navigate({ to: "/doubt-solver/$threadId", params: { threadId: target }, replace: true });
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: "var(--tutor-bg)", color: "oklch(0.97 0.01 240)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "var(--gradient-tutor)" }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--tutor-border)", background: "oklch(0.16 0.05 255 / 0.82)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => setDrawer((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors"
            style={{ borderColor: "var(--tutor-border)", color: "var(--tutor-sky)" }}
            aria-label="Conversations"
          >
            <MessagesSquare className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-base" style={{ color: "var(--tutor-sky-soft)" }}>
              The Doubt Solver
            </p>
            <p className="truncate text-[11px] opacity-60">{active?.title ?? "New doubt"}</p>
          </div>
          <button
            onClick={startThread}
            className="grid h-10 w-10 place-items-center rounded-xl border transition-colors"
            style={{ borderColor: "var(--tutor-border)", color: "var(--tutor-sky)" }}
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Link
            to="/"
            className="grid h-10 w-10 place-items-center rounded-xl border transition-colors"
            style={{ borderColor: "var(--tutor-border)", color: "var(--tutor-sky)" }}
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {drawer && (
          <div
            className="mx-auto max-w-3xl border-t px-4 py-3"
            style={{ borderColor: "var(--tutor-border)" }}
          >
            <p className="mb-2 text-[10px] uppercase tracking-[0.25em] opacity-60">Your doubts</p>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {threads.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2"
                  style={{
                    borderColor: t.id === threadId ? "var(--tutor-sky)" : "var(--tutor-border)",
                    background: t.id === threadId ? "oklch(0.8 0.15 225 / 0.1)" : "transparent",
                  }}
                >
                  <button
                    onClick={() => {
                      setDrawer(false);
                      void navigate({ to: "/doubt-solver/$threadId", params: { threadId: t.id } });
                    }}
                    className="min-w-0 flex-1 truncate text-left text-sm"
                  >
                    {t.title}
                  </button>
                  <button
                    onClick={() => removeThread(t.id)}
                    className="shrink-0 opacity-50 transition-opacity hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Transcript */}
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-4 pb-40 pt-6">
        {!messages.length && (
          <div className="mt-10 text-center">
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-3xl"
              style={{
                background: "linear-gradient(135deg, oklch(0.8 0.15 225), oklch(0.55 0.16 265))",
                boxShadow: "var(--shadow-tutor)",
              }}
            >
              <Sparkles className="h-7 w-7" style={{ color: "var(--tutor-deep)" }} />
            </div>
            <h1 className="font-display mt-6 text-4xl" style={{ color: "var(--tutor-sky-soft)" }}>
              What's confusing you today?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm opacity-70">
              No boring coaching-class answers. Just clear, funny explanations — with
              diagrams when things get tricky.
            </p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border px-4 py-3 text-left text-sm transition-colors"
                  style={{ borderColor: "var(--tutor-border)", background: "var(--tutor-surface)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((m) => {
            const text = textOf(m);
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div
                    className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-lg px-4 py-3 text-[15px]"
                    style={{ background: "oklch(0.8 0.15 225)", color: "oklch(0.14 0.05 255)" }}
                  >
                    {text}
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className="max-w-full">
                <p
                  className="font-display mb-1.5 text-[10px] uppercase tracking-[0.25em]"
                  style={{ color: "var(--tutor-sky)" }}
                >
                  Tutor
                </p>
                <TutorMarkdown content={text} />
              </div>
            );
          })}

          {busy && (
            <p
              className="animate-pulse font-display text-sm"
              style={{ color: "var(--tutor-sky)" }}
            >
              Thinking…
            </p>
          )}
          {error && (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message}
            </p>
          )}
        </div>
        <div ref={bottomRef} />
      </main>

      {/* Composer */}
      <div
        className="fixed inset-x-0 bottom-0 z-20 border-t backdrop-blur-xl"
        style={{ borderColor: "var(--tutor-border)", background: "oklch(0.16 0.05 255 / 0.9)" }}
      >
        <form
          className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask your doubt…"
            className="max-h-40 min-h-[52px] flex-1 resize-none rounded-2xl border px-4 py-3.5 text-[15px] outline-none"
            style={{
              borderColor: "var(--tutor-border)",
              background: "var(--tutor-surface)",
              color: "inherit",
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl transition-transform disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, oklch(0.8 0.15 225), oklch(0.6 0.17 255))",
              color: "oklch(0.12 0.05 260)",
              boxShadow: "var(--shadow-tutor)",
            }}
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
