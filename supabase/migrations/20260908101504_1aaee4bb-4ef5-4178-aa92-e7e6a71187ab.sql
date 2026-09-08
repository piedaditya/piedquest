-- 1. Player columns for daily counters + paid access expiry
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS daily_quests_played integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_reset_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  ADD COLUMN IF NOT EXISTS tier_expires_at timestamptz;

-- 2. Demo passes (one per user, ever)
CREATE TABLE IF NOT EXISTS public.demo_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'special',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.demo_passes TO authenticated;
GRANT ALL ON public.demo_passes TO service_role;
ALTER TABLE public.demo_passes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own demo pass"
  ON public.demo_passes FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS demo_passes_active_idx
  ON public.demo_passes (expires_at) WHERE revoked_at IS NULL;

CREATE TRIGGER demo_passes_set_updated_at
  BEFORE UPDATE ON public.demo_passes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Checkout sessions (audit + fulfilment)
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL,
  billing_cycle text NOT NULL,
  country_code text NOT NULL DEFAULT 'US',
  currency text NOT NULL,
  amount_minor integer NOT NULL,
  provider text NOT NULL DEFAULT 'stripe',
  provider_session_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.checkout_sessions TO authenticated;
GRANT ALL ON public.checkout_sessions TO service_role;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own checkout sessions"
  ON public.checkout_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS checkout_sessions_user_idx
  ON public.checkout_sessions (user_id, created_at DESC);

CREATE TRIGGER checkout_sessions_set_updated_at
  BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Server-side maintenance routines
CREATE OR REPLACE FUNCTION public.expire_demo_passes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  WITH expired AS (
    UPDATE public.demo_passes
       SET revoked_at = now()
     WHERE revoked_at IS NULL
       AND expires_at <= now()
    RETURNING user_id
  )
  UPDATE public.users u
     SET active_tier = 'free',
         tier_expires_at = NULL
    FROM expired e
   WHERE u.id = e.user_id;
  GET DIAGNOSTICS affected = ROW_COUNT;

  -- also revert any paid tier whose paid window lapsed
  UPDATE public.users
     SET active_tier = 'free',
         tier_expires_at = NULL
   WHERE tier_expires_at IS NOT NULL
     AND tier_expires_at <= now();

  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_demo_passes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_demo_passes() TO service_role;

CREATE OR REPLACE FUNCTION public.reset_daily_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
     SET daily_quests_played = 0,
         daily_reset_date = (now() AT TIME ZONE 'utc')::date
   WHERE daily_reset_date < (now() AT TIME ZONE 'utc')::date
      OR daily_quests_played <> 0;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_daily_counters() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_daily_counters() TO service_role;

-- 5. Schedules: midnight UTC full reset, hourly pass expiry sweep
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.unschedule(jobid) FROM cron.job
 WHERE jobname IN ('piedquest-midnight-reset', 'piedquest-demo-pass-sweep');

SELECT cron.schedule(
  'piedquest-midnight-reset',
  '0 0 * * *',
  $$SELECT public.reset_daily_counters(); SELECT public.expire_demo_passes();$$
);

SELECT cron.schedule(
  'piedquest-demo-pass-sweep',
  '0 * * * *',
  $$SELECT public.expire_demo_passes();$$
);
