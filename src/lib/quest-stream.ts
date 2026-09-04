// Client-side consumer for the chunked AI quest stream.
// Questions arrive 10 at a time so huge banks (up to 200) never hit a single
// request timeout and the UI can render progress as they land.
import { supabase } from "@/integrations/supabase/client";
import { getClientId } from "@/lib/leaderboard";
import type {
  AnswerMode,
  Difficulty,
  GeneratedQuestion,
} from "@/lib/custom-quest.server";

export interface StreamRequest {
  topic: string;
  difficulty: Difficulty;
  mode: AnswerMode;
  count: number;
  theme?: string;
}

export interface StreamHandlers {
  onChunk: (questions: GeneratedQuestion[], total: number) => void;
  onNotFound: () => void;
}

export async function streamQuest(
  req: StreamRequest,
  handlers: StreamHandlers,
): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch("/api/quest-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      topic: req.topic,
      difficulty: req.difficulty,
      mode: req.mode,
      count: req.count,
      ...(req.theme ? { theme: req.theme } : {}),
      clientKey: getClientId(),
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(
      res.status === 400 ? "Give your quest a valid topic first." : "Generation failed",
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let streamError: string | null = null;

  const handleLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let event: { type?: string; questions?: GeneratedQuestion[]; total?: number; message?: string };
    try {
      event = JSON.parse(trimmed);
    } catch {
      return;
    }
    if (event.type === "chunk" && Array.isArray(event.questions)) {
      handlers.onChunk(event.questions, event.total ?? event.questions.length);
    } else if (event.type === "not_found") {
      handlers.onNotFound();
    } else if (event.type === "error") {
      streamError = event.message ?? "Generation failed";
    }
  };

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    }
    if (buffer) handleLine(buffer);
  } catch (e) {
    // Navigating away / cancelling closes the stream — not an app error.
    if (e instanceof Error && (e.name === "AbortError" || e.name === "TypeError")) return;
    throw e;
  }

  if (streamError) throw new Error(streamError);
}
