import { createServerFn } from "@tanstack/react-start";

export interface SubmitDailyInput {
  clientId: string;
  username: string;
  quizDate: string;
  answers: (string | null)[];
  timeMs: number;
  tabSwitches: number;
  disqualified: boolean;
}

export const submitDailyResult = createServerFn({ method: "POST" })
  .inputValidator((input: SubmitDailyInput) => {
    if (!input || typeof input.clientId !== "string" || typeof input.quizDate !== "string") {
      throw new Error("Invalid submission");
    }
    return {
      clientId: input.clientId,
      username: typeof input.username === "string" ? input.username : "Player",
      quizDate: input.quizDate,
      answers: Array.isArray(input.answers)
        ? input.answers.slice(0, 15).map((a) => (typeof a === "string" ? a.slice(0, 300) : null))
        : [],
      timeMs: Number(input.timeMs) || 0,
      tabSwitches: Number(input.tabSwitches) || 0,
      disqualified: input.disqualified === true,
    } satisfies SubmitDailyInput;
  })
  .handler(async ({ data }) => {
    const { recordDailyResult } = await import("./leaderboard-scoring.server");
    return recordDailyResult(data);
  });
