REVOKE ALL ON FUNCTION public.is_league_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid, uuid) TO authenticated, service_role;