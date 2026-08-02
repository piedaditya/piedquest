import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  TUTOR_SYSTEM_PROMPT,
} from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/doubt-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system: TUTOR_SYSTEM_PROMPT,
          messages: convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
