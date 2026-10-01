CREATE OR REPLACE FUNCTION public.reset_daily_counters()
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.users
     SET daily_quests_played = 0,
         daily_reset_date = (now() AT TIME ZONE 'Asia/Kolkata')::date
   WHERE daily_reset_date < (now() AT TIME ZONE 'Asia/Kolkata')::date
      OR daily_quests_played <> 0;
END;
$$;

-- Demo expiry must never downgrade a user who has since paid.
CREATE OR REPLACE FUNCTION public.expire_demo_passes()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.demo_passes SET revoked_at = now()
   WHERE revoked_at IS NULL AND expires_at <= now();
  GET DIAGNOSTICS affected = ROW_COUNT;

  UPDATE public.users
     SET active_tier = 'free', tier_expires_at = NULL
   WHERE tier_expires_at IS NOT NULL AND tier_expires_at <= now();
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reset_daily_counters() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_demo_passes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_ai_budget(text, text, integer) FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'piedquest-midnight-reset';
-- 00:00 IST == 18:30 UTC
SELECT cron.schedule(
  'piedquest-midnight-reset',
  '30 18 * * *',
  $c$SELECT public.reset_daily_counters(); SELECT public.expire_demo_passes();$c$
);