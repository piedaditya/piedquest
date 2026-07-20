CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text NOT NULL UNIQUE,
  username text NOT NULL,
  streak integer NOT NULL DEFAULT 0,
  xp integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.leaderboard TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is public readable"
  ON public.leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert leaderboard rows"
  ON public.leaderboard FOR INSERT
  WITH CHECK (
    length(username) BETWEEN 1 AND 32
    AND length(client_id) BETWEEN 8 AND 64
    AND streak >= 0 AND streak <= 10000
    AND xp >= 0 AND xp <= 10000000
    AND score >= 0 AND score <= 5
  );

CREATE POLICY "Anyone can update leaderboard rows"
  ON public.leaderboard FOR UPDATE
  USING (true)
  WITH CHECK (
    length(username) BETWEEN 1 AND 32
    AND streak >= 0 AND streak <= 10000
    AND xp >= 0 AND xp <= 10000000
    AND score >= 0 AND score <= 5
  );

CREATE INDEX leaderboard_xp_desc ON public.leaderboard (xp DESC);
CREATE INDEX leaderboard_streak_desc ON public.leaderboard (streak DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER leaderboard_set_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
