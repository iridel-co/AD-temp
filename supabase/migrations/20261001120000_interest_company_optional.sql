-- Company is now optional on the interest form.
-- The existing upsert function is left as-is: it writes `company = excluded.company`,
-- so replace it below to keep an existing company when a resubmit leaves it blank.
alter table public.interest_signups alter column company drop not null;

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
  )
  on conflict ((lower(email))) do update set
    full_name       = excluded.full_name,
    designation     = excluded.designation,
    company         = coalesce(excluded.company, public.interest_signups.company),
    interest        = excluded.interest,
    source_path     = excluded.source_path,
    consent_privacy = excluded.consent_privacy,
    consent_updates = excluded.consent_updates,
    consent_version = excluded.consent_version,
    user_agent      = excluded.user_agent,
    updated_at      = now();
$$;

revoke all on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_interest_signup(text, text, text, text, text, text, boolean, boolean, text, text)
  to service_role;

notify pgrst, 'reload schema';
