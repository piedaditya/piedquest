CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'registered' CHECK (role IN ('guest','registered')),
  xp integer NOT NULL DEFAULT 0,
  hearts integer NOT NULL DEFAULT 5 CHECK (hearts >= 0 AND hearts <= 5),
  hearts_updated_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz NOT NULL DEFAULT now(),
  streak integer NOT NULL DEFAULT 0,
  active_tier text NOT NULL DEFAULT 'free' CHECK (active_tier IN ('free','gold','special')),
  migrated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();