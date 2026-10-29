-- Leaderboard tables are no longer readable directly from the browser:
-- reads happen through server functions using the service role, so the
-- permissive signed-in SELECT policies are removed and both tables are
-- locked for anon/authenticated. RLS stays enabled (deny by default).
DROP POLICY IF EXISTS "Daily leaderboard for signed-in players" ON public.daily_leaderboard;
DROP POLICY IF EXISTS "Leaderboard for signed-in players" ON public.leaderboard;

REVOKE SELECT ON public.daily_leaderboard FROM authenticated;
REVOKE SELECT ON public.leaderboard FROM authenticated;
-- Anon had a stray DELETE grant with no policy; remove it too.
REVOKE DELETE ON public.daily_leaderboard FROM anon;
REVOKE DELETE ON public.leaderboard FROM anon;

-- Service role keeps full access for server-side scoring/reads.
GRANT ALL ON public.daily_leaderboard TO service_role;
GRANT ALL ON public.leaderboard TO service_role;