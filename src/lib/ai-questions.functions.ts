import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateQuestions } from "./ai-questions.server";

const InputSchema = z.object({
  category: z.string(),
  region: z.string(),
  count: z.number(),
  asked: z.array(z.string()),
});

export const generateAiQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const count = Math.min(Math.max(data.count, 1), 5);
    const questions = await generateQuestions({
      category: data.category,
      region: data.region,
      count,
      asked: data.asked.slice(-60),
    });
    return { questions };
  });
