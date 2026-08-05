REVOKE ALL ON FUNCTION public.consume_ai_budget(text, text, integer) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated, PUBLIC;