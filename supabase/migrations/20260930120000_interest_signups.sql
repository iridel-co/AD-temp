-- Event interest list (Oct 2 2026). Chan applies this manually in the Supabase SQL editor.
-- Written only by the Next.js route handler using the server-side secret key (bypasses RLS).
create table if not exists public.interest_signups (
  id               uuid primary key default gen_random_uuid(),
  full_name        text not null check (char_length(full_name) between 2 and 120),
  email            text not null check (char_length(email) between 3 and 254),
  designation      text not null check (char_length(designation) between 2 and 120),
  company          text not null check (char_length(company) between 2 and 120),
  interest         text not null check (interest in ('workshops', 'corporate', 'both')),
  source_path      text check (source_path is null or char_length(source_path) <= 300),
  consent_privacy  boolean not null check (consent_privacy = true),
  consent_updates  boolean not null default false,
  consent_version  text not null,
  user_agent       text check (user_agent is null or char_length(user_agent) <= 512),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists interest_signups_email_lower_key
  on public.interest_signups (lower(email));

alter table public.interest_signups enable row level security;
-- Deliberately NO policies: anon/authenticated get nothing. The secret key bypasses RLS.
revoke all on table public.interest_signups from anon, authenticated;

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
    company         = excluded.company,
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
