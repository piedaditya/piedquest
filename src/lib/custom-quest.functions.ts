import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateCustomQuest } from "./custom-quest.server";

const InputSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  difficulty: z.enum(["Easy", "Normal", "Hard", "Extreme"]),
  mode: z.enum(["mcq", "typing"]),
  count: z.number().int().min(1).max(10),
});

export const generateMyQuest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const { questions, notFound } = await generateCustomQuest(data);
    return { questions, notFound };
  });
