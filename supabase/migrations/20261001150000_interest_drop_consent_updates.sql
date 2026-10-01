-- Drop the "send me updates" consent: the form no longer asks for it and nothing
-- reads it (it has been stored as false on every row). Privacy consent stays —
-- it is what makes storing the signup lawful (RA 10173).
--
-- Deploy-safe: the live site still posts p_consent_updates until the next push,
-- so the old signature is kept (now ignoring that argument) alongside a new
-- overload without it. PostgREST picks the overload by argument names.

-- Old signature, still called by the currently deployed route. Ignores p_consent_updates.
create or replace function public.upsert_interest_signup(
  p_full_name text, p_email text, p_designation text, p_company text,
  p_interest text, p_source_path text, p_consent_privacy boolean,
  p_consent_updates boolean, p_consent_version text, p_user_agent text
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.interest_signups (
    full_name, email, designation, company, interest, source_path,
    consent_privacy, consent_version, user_agent
  ) values (
    p_full_name, lower(trim(p_email)), p_designation, p_company, p_interest, p_source_path,
    p_consent_privacy, p_consent_version, p_user_agent
  );
$$;

-- New signature, called by the route after the next deploy.
create or replace function public.upsert_interest_signup(
  p_full_name text, p_email text, p_designation text, p_company text,
  p_interest text, p_source_path text, p_consent_privacy boolean,
  p_consent_version text, p_user_agent text
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.interest_signups (
    full_name, email, designation, company, interest, source_path,
    consent_privacy, consent_version, user_agent
  ) values (
    p_full_name, lower(trim(p_email)), p_designation, p_company, p_interest, p_source_path,
    p_consent_privacy, p_consent_version, p_user_agent
  );
$$;

revoke all on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, text, text)
  to service_role;

alter table public.interest_signups drop column if exists consent_updates;

notify pgrst, 'reload schema';

-- After the next deploy is live, remove the old signature:
--   drop function if exists public.upsert_interest_signup(
--     text, text, text, text, text, text, boolean, boolean, text, text);
--   notify pgrst, 'reload schema';
