import {
  callGateway,
  QUICK_QA_SYSTEM_PROMPT,
} from "./ai-gateway.server";
import { callGemini, hasGeminiKey } from "./gemini.server";

export async function answerQuestion(question: string): Promise<string> {
  try {
    return await callGateway({ system: QUICK_QA_SYSTEM_PROMPT, prompt: question });
  } catch (error) {
    if (!hasGeminiKey()) throw error;
    return callGemini({ system: QUICK_QA_SYSTEM_PROMPT, prompt: question });
  }
}
