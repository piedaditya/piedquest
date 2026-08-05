CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key text NOT NULL,
  feature text NOT NULL,
  usage_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  request_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_key, feature, usage_date)
);

GRANT ALL ON public.ai_usage TO service_role;

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER ai_usage_set_updated_at
BEFORE UPDATE ON public.ai_usage
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.consume_ai_budget(_client_key text, _feature text, _limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.ai_usage (client_key, feature, request_count)
  VALUES (_client_key, _feature, 1)
  ON CONFLICT (client_key, feature, usage_date)
  DO UPDATE SET request_count = public.ai_usage.request_count + 1
  RETURNING request_count INTO new_count;

  RETURN new_count <= _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_budget(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_budget(text, text, integer) TO service_role;