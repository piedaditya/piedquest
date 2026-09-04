import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateCustomQuest } from "./custom-quest.server";

const InputSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  difficulty: z.enum(["Easy", "Normal", "Hard", "Extreme"]),
  mode: z.enum(["mcq", "typing"]),
  count: z.number().int().min(1).max(25),
  avoid: z.array(z.string()).max(40).optional(),
});

export const generateMyQuest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { enforceAiBudget } = await import("./ai-rate-limit.server");
      await enforceAiBudget("custom_quest");
      const { questions, notFound } = await generateCustomQuest(data);
      return { questions, notFound, generationError: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Quest generation failed.";
      const isTemporary =
        /high demand|try again|busy|rate limit|429|50[0234]|unavailable/i.test(message);

      return {
        questions: [],
        notFound: false,
        generationError: isTemporary
          ? "PIEDQUEST AI is busy right now. Your setup is safe—please wait a moment and try again."
          : message,
      };
    }
  });
