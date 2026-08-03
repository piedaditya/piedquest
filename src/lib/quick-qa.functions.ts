import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { answerQuestion } from "./quick-qa.server";

const InputSchema = z.object({ question: z.string().trim().min(3).max(600) });

export const askQuickQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => ({ answer: await answerQuestion(data.question) }));
