-- Odobrať verejným rolám právo spúšťať SECURITY DEFINER helper (nález WARN).
-- Na stagingu už spustené ručne 3. 8.; táto migrácia to len verzuje.
-- Prisma privilégiá funkcií netrackuje → žiadny drift, opakované spustenie neškodné.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;
