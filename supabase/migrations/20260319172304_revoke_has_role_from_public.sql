-- Security fix: restrict has_role() execution to trusted roles only.
--
-- has_role() is SECURITY DEFINER, which means it runs with elevated privileges
-- and can bypass RLS. Leaving it executable by PUBLIC (including anon) allows
-- unauthenticated callers to probe admin UUIDs via:
--   SELECT has_role('<uuid>', 'admin')
--
-- Fix: revoke EXECUTE from PUBLIC and grant only to authenticated and
-- service_role so authenticated sessions and trusted backend callers keep working.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;
