import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getLocalDateString } from "./quiz-storage";
import { getMockPool } from "./practice-mocks";
import { buildGlobalDaily } from "./global-daily";
import { shuffleOptionsAll } from "./shuffle-options";
import {
  getGKRegional,
  getGKWorld,
  getRegionalMovies,
  type Region,
} from "./regional-content";

export interface Question {
  id: string;
  quizNumber: number;
  order: number;
  question: string;
  choices: string[];
  correctIndex: number;
  category: string | null;
  explanation?: string;
  aiGenerated?: boolean;
  difficulty?: "easy" | "medium" | "hard" | "extreme";
}

export interface DailyQuiz {
  quizDate: string;
  quizNumber: number;
  questions: Question[];
}

async function fetchTodaysQuiz(): Promise<DailyQuiz | null> {
  // The Global Daily Challenge is 100% universal and educational: it is built
  // deterministically from the graded universal bank, never from regional or
  // pop-culture content.
  return buildGlobalDaily(getLocalDateString());
}

export const dailyQuizQueryOptions = queryOptions({
  queryKey: ["daily-quiz", getLocalDateString()],
  queryFn: fetchTodaysQuiz,
  staleTime: 5 * 60_000,
});

export const FANDOM_CATEGORIES = [
  "All Fandoms",
  "Anime",
  "Gaming",
  "Pop Culture",
  "Movies",
  "TV",
  "Music",
  "GK",
] as const;

async function fetchPracticePool(
  category: string | null,
  region: Region,
  gkScope: "global" | "regional" = "global",
): Promise<Question[]> {
  let query = supabase
    .from("daily_questions")
    .select("id, quiz_date, quiz_number, question_order, question, choices, correct_index, category")
    .limit(200);

  if (category && category !== "All Fandoms" && category !== "GK") {
    query = query.eq("category", category);
  }

  // Category-specific mocks. Movies is region-aware; GK categories are
  // sourced entirely from the regional-content pools.
  let mocks: Question[] = [];
  if (category === "GK") {
    mocks =
      gkScope === "regional"
        ? getGKRegional(region === "Global" ? "India" : region)
        : getGKWorld();
  } else if (category === "Movies") {
    mocks = [...getMockPool("Movies"), ...getRegionalMovies(region)];
  } else if (!category || category === "All Fandoms") {
    mocks = [
      ...getMockPool(null),
      ...getRegionalMovies(region),
      ...getGKWorld(),
      ...getGKRegional(region),
    ];
  } else {
    mocks = getMockPool(category);
  }

  const { data, error } = await query;
  if (error) {
    // Fall back to local pool if network/db fails so practice never appears empty.
    return shuffleOptionsAll(mocks);
  }
  const fromDb: Question[] = (data ?? []).map((row) => ({
    id: row.id,
    quizNumber: row.quiz_number,
    order: row.question_order,
    question: row.question,
    choices: row.choices as string[],
    correctIndex: row.correct_index,
    category: row.category,
  }));
  return shuffleOptionsAll([...fromDb, ...mocks]);
}

export const practicePoolQueryOptions = (
  category: string | null,
  region: Region = "Global",
  gkScope: "global" | "regional" = "global",
) =>
  queryOptions({
    queryKey: ["practice-pool", category ?? "all", region, gkScope],
    queryFn: () => fetchPracticePool(category, region, gkScope),
    staleTime: 10 * 60_000,
  });