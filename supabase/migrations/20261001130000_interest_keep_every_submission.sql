-- Keep every submission: a repeat email now adds a new row instead of overwriting
-- the earlier one. Duplicates are merged at handover (see the query at the bottom).
-- The function keeps its old name so the deployed route needs no change.
drop index if exists public.interest_signups_email_lower_key;

create index if not exists interest_signups_email_lower_idx
  on public.interest_signups (lower(email));

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
    consent_privacy, consent_updates, consent_version, user_agent
  ) values (
    p_full_name, lower(trim(p_email)), p_designation, p_company, p_interest, p_source_path,
    p_consent_privacy, p_consent_updates, p_consent_version, p_user_agent
  );
$$;

revoke all on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
  to service_role;

notify pgrst, 'reload schema';

-- Handover: latest submission per person, with how many times they signed up.
--   select distinct on (lower(email)) *,
--          count(*) over (partition by lower(email)) as submissions
--   from public.interest_signups
--   order by lower(email), created_at desc;
