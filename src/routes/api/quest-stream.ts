import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/start-client-core";
import { z } from "zod";

import {
  generateCustomQuest,
  type GeneratedQuestion,
} from "@/lib/custom-quest.server";
import { readRecentHistory, recordHistory } from "@/lib/quest-history.server";

const CHUNK_SIZE = 10;

const BodySchema = z.object({
  topic: z.string().trim().min(2).max(200),
  difficulty: z.enum(["Easy", "Normal", "Hard", "Extreme"]),
  mode: z.enum(["mcq", "typing"]),
  count: z.number().int().min(1).max(200),
  theme: z.string().trim().max(80).optional(),
  clientKey: z.string().trim().min(4).max(80),
});

type Tier = "free" | "gold" | "special";

async function resolveCaller(request: Request): Promise<{ userId: string | null; tier: Tier }> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!token) return { userId: null, tier: "free" };
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.getUser(token);
    const userId = data.user?.id ?? null;
    if (!userId) return { userId: null, tier: "free" };
    const { data: row } = await supabaseAdmin
      .from("users")
      .select("active_tier")
      .eq("id", userId)
      .maybeSingle();
    const tier = (row?.active_tier as Tier | undefined) ?? "free";
    return { userId, tier };
  } catch {
    return { userId: null, tier: "free" };
  }
}

export const Route = createFileRoute("/api/quest-stream")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: z.infer<typeof BodySchema>;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request", { status: 400 });
        }

        const { userId, tier } = await resolveCaller(request);
        const owner = { userId, clientKey: body.clientKey };
        // Custom hosts are a Gold/Special perk — locked for free players.
        const theme = tier === "gold" || tier === "special" ? body.theme : undefined;

        const encoder = new TextEncoder();
        const signal = request.signal;
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            // The client may navigate away mid-generation; that aborts the
            // request and must not be treated as an application error.
            const send = (payload: unknown) => {
              if (signal.aborted) return;
              try {
                controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
              } catch {
                /* stream already closed by the client */
              }
            };
            try {
              const { enforceAiBudget } = await import("@/lib/ai-rate-limit.server");
              const history = await readRecentHistory(owner, body.topic);
              const collected: GeneratedQuestion[] = [];
              let remaining = body.count;

              // Chunked generation keeps every model call short so long banks
              // stream in instead of blowing a single request timeout.
              while (remaining > 0) {
                const size = Math.min(CHUNK_SIZE, remaining);
                await enforceAiBudget("custom_quest");
                const { questions, notFound } = await generateCustomQuest({
                  topic: body.topic,
                  difficulty: body.difficulty,
                  mode: body.mode,
                  count: size,
                  avoid: collected.slice(-40).map((q) => q.question),
                  history,
                  tier,
                  ...(theme ? { theme } : {}),
                });

                if (notFound && !collected.length) {
                  send({ type: "not_found" });
                  controller.close();
                  return;
                }
                if (!questions.length) break;

                collected.push(...questions);
                remaining -= size;
                send({ type: "chunk", questions, total: collected.length });
                void recordHistory(owner, body.topic, questions.map((q) => q.question));
              }

              send({ type: "done", total: collected.length });
            } catch (e) {
              send({
                type: "error",
                message: e instanceof Error ? e.message : "Generation failed",
              });
            } finally {
              try {
                controller.close();
              } catch {
                /* already closed */
              }
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
