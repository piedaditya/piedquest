-- ============ PROFILES (public player card) ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT 'Player',
  tier text NOT NULL DEFAULT 'free',
  xp integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX profiles_xp_idx ON public.profiles (xp DESC, streak DESC);
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ LEAGUES ============
CREATE TABLE public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Friend League',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leagues TO authenticated;
GRANT ALL ON public.leagues TO service_role;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.league_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);

GRANT SELECT, DELETE ON public.league_members TO authenticated;
GRANT ALL ON public.league_members TO service_role;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_league_member(_league_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = _league_id AND user_id = _user_id
  );
$$;

CREATE POLICY "Members can view their leagues"
  ON public.leagues FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_league_member(id, auth.uid()));

CREATE POLICY "Members can view league membership"
  ON public.league_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_member(league_id, auth.uid()));

CREATE POLICY "Members can leave a league"
  ON public.league_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX league_members_user_idx ON public.league_members (user_id);
CREATE INDEX league_members_league_idx ON public.league_members (league_id);
CREATE TRIGGER leagues_set_updated_at BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ VAULT (saved custom quests) ============
CREATE TABLE public.vault_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Normal',
  mode text NOT NULL DEFAULT 'mcq',
  question_count integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_quests TO authenticated;
GRANT ALL ON public.vault_quests TO service_role;
ALTER TABLE public.vault_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own vault"
  ON public.vault_quests FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX vault_quests_user_idx ON public.vault_quests (user_id, created_at DESC);
CREATE TRIGGER vault_quests_set_updated_at BEFORE UPDATE ON public.vault_quests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();