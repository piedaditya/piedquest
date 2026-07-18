import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLocalDateString } from "./quiz-storage";

export interface Question {
  id: string;
  quizNumber: number;
  order: number;
  question: string;
  choices: string[];
  correctIndex: number;
  category: string | null;
}

export interface DailyQuiz {
  quizDate: string;
  quizNumber: number;
  questions: Question[];
}

async function fetchTodaysQuiz(): Promise<DailyQuiz | null> {
  const today = getLocalDateString();
  const { data, error } = await supabase
    .from("daily_questions")
    .select("id, quiz_date, quiz_number, question_order, question, choices, correct_index, category")
    .eq("quiz_date", today)
    .order("question_order", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const questions: Question[] = data.map((row) => ({
    id: row.id,
    quizNumber: row.quiz_number,
    order: row.question_order,
    question: row.question,
    choices: row.choices as string[],
    correctIndex: row.correct_index,
    category: row.category,
  }));

  return {
    quizDate: today,
    quizNumber: questions[0].quizNumber,
    questions,
  };
}

export const dailyQuizQueryOptions = queryOptions({
  queryKey: ["daily-quiz", getLocalDateString()],
  queryFn: fetchTodaysQuiz,
  staleTime: 5 * 60_000,
});