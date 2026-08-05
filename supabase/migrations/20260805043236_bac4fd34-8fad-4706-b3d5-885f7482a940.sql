DROP TABLE IF EXISTS public.doubt_messages;
DROP TABLE IF EXISTS public.doubt_threads;

DROP POLICY IF EXISTS "Anyone can insert leaderboard rows" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can update leaderboard rows" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can insert daily runs" ON public.daily_leaderboard;
DROP POLICY IF EXISTS "Anyone can update daily runs" ON public.daily_leaderboard;

REVOKE INSERT, UPDATE, DELETE ON public.leaderboard FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.daily_leaderboard FROM anon, authenticated;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT ON public.daily_leaderboard TO anon, authenticated;
GRANT ALL ON public.leaderboard TO service_role;
GRANT ALL ON public.daily_leaderboard TO service_role;