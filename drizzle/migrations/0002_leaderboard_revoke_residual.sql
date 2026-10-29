-- Final cleanup: no anon/authenticated privileges remain on the leaderboard tables.
REVOKE ALL ON public.daily_leaderboard FROM anon;
REVOKE ALL ON public.daily_leaderboard FROM authenticated;
REVOKE ALL ON public.leaderboard FROM anon;
REVOKE ALL ON public.leaderboard FROM authenticated;