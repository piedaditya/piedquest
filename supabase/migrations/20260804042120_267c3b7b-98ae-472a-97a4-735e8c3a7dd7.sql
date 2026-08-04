CREATE TABLE public.daily_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text NOT NULL,
  quiz_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  score integer NOT NULL DEFAULT 0,
  time_ms integer NOT NULL DEFAULT 0,
  tab_switches integer NOT NULL DEFAULT 0,
  disqualified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quiz_date)
);

GRANT SELECT, INSERT, UPDATE ON public.daily_leaderboard TO anon;
GRANT SELECT, INSERT, UPDATE ON public.daily_leaderboard TO authenticated;
GRANT ALL ON public.daily_leaderboard TO service_role;

ALTER TABLE public.daily_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily leaderboard is public readable"
  ON public.daily_leaderboard FOR SELECT USING (true);

CREATE POLICY "Anyone can insert daily runs"
  ON public.daily_leaderboard FOR INSERT
  WITH CHECK (
    length(user_id) >= 8 AND length(user_id) <= 64
    AND length(username) >= 1 AND length(username) <= 32
    AND score >= 0 AND score <= 15
    AND time_ms >= 0 AND time_ms <= 86400000
    AND tab_switches >= 0 AND tab_switches <= 1000
  );

CREATE POLICY "Anyone can update daily runs"
  ON public.daily_leaderboard FOR UPDATE USING (true)
  WITH CHECK (
    length(username) >= 1 AND length(username) <= 32
    AND score >= 0 AND score <= 15
    AND time_ms >= 0 AND time_ms <= 86400000
    AND tab_switches >= 0 AND tab_switches <= 1000
  );

CREATE INDEX daily_leaderboard_rank_idx
  ON public.daily_leaderboard (quiz_date, score DESC, time_ms ASC);

CREATE TRIGGER daily_leaderboard_set_updated_at
  BEFORE UPDATE ON public.daily_leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();