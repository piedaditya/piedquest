import { createFileRoute } from "@tanstack/react-router";

import { buildGlobalDaily } from "@/lib/global-daily";

/**
 * Midnight maintenance endpoint.
 * - resets every player's daily quest counter
 * - revokes expired 24h demo passes / lapsed paid tiers
 * - materialises a fresh 15-question Global Daily Challenge for the new date
 *
 * Protected by a shared bearer secret; the database schedule also runs the
 * SQL half on its own, so this endpoint is safe to call more than once.
 */
async function run(request: Request): Promise<Response> {
  const secret = process.env["CRON_SECRET"];
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret") ??
    "";
  if (!secret || provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const date = new Date().toISOString().slice(0, 10);

  const [resetRes, expireRes] = await Promise.all([
    supabaseAdmin
      .from("users")
      .update({ daily_quests_played: 0, daily_reset_date: date })
      .neq("daily_reset_date", date),
    supabaseAdmin.rpc("expire_demo_passes" as never),
  ]);

  const quiz = buildGlobalDaily(date);


  const { count } = await supabaseAdmin
    .from("daily_questions")
    .select("id", { count: "exact", head: true })
    .eq("quiz_date", date);

  let generated = 0;
  if (!count) {
    const rows = quiz.questions.map((q, i) => ({
      quiz_date: date,
      quiz_number: quiz.quizNumber,
      question_order: i,
      question: q.question,
      choices: q.choices,
      correct_index: q.correctIndex,
      category: q.category,
    }));
    const { error } = await supabaseAdmin.from("daily_questions").insert(rows);
    if (!error) generated = rows.length;
  }

  return Response.json({
    ok: true,
    date,
    countersReset: !resetRes.error,
    passesSwept: !expireRes.error,
    generated,
  });
}

export const Route = createFileRoute("/api/public/cron/midnight")({
  server: {
    handlers: {
      GET: ({ request }) => run(request),
      POST: ({ request }) => run(request),
    },
  },
});
