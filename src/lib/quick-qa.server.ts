import { generateText } from "ai";
import {
  createLovableAiGatewayProvider,
  QUICK_QA_SYSTEM_PROMPT,
} from "./ai-gateway.server";
import { callGemini, hasGeminiKey } from "./gemini.server";

export async function answerQuestion(question: string): Promise<string> {
  if (hasGeminiKey()) {
    return callGemini({ system: QUICK_QA_SYSTEM_PROMPT, prompt: question });
  }

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const gateway = createLovableAiGatewayProvider(key);
  const { text } = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    system: QUICK_QA_SYSTEM_PROMPT,
    prompt: question,
  });

  return text.trim();
}
