import { createServerFn } from "@tanstack/react-start";

export const askQuickQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (
      typeof input !== "object" ||
      input === null ||
      !("question" in input) ||
      typeof input.question !== "string"
    ) {
      throw new Error("Enter a valid question.");
    }

    const question = input.question.trim();
    if (question.length < 3 || question.length > 600) {
      throw new Error("Your question must be between 3 and 600 characters.");
    }

    return { question };
  })
  .handler(async ({ data }) => {
    try {
      const [{ enforceAiBudget }, { answerQuestion }] = await Promise.all([
        import("./ai-rate-limit.server"),
        import("./quick-qa.server"),
      ]);
      await enforceAiBudget("quick_qa");
      return { ok: true as const, answer: await answerQuestion(data.question) };
    } catch (error) {
      const details =
        typeof error === "object" && error !== null
          ? (error as { statusCode?: unknown; message?: unknown })
          : undefined;
      const message = typeof details?.message === "string" ? details.message : "";

      if (details?.statusCode === 402 || message.toLowerCase().includes("payment required")) {
        return {
          ok: false as const,
          error: "AI credits are exhausted. Add credits in Settings → Plans & credits to keep asking questions.",
        };
      }

      if (details?.statusCode === 429) {
        return {
          ok: false as const,
          error: "PIEDQUEST AI is receiving too many requests. Please try again shortly.",
        };
      }

      return {
        ok: false as const,
        error: "Couldn't fetch an answer right now. Please try again in a moment.",
      };
    }
  });
