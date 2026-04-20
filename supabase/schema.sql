-- =====================================================================
-- Make-a-Thon 7.0 — Database Schema
-- Run this entire file in Supabase SQL Editor (one-shot).
-- This version uses user_roles for admin access and creates storage buckets.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Team number sequence (max 60 teams)
create sequence if not exists team_number_seq start 1 maxvalue 60;

-- =========================
-- Tables
-- =========================
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz default now(),
  unique (user_id, role)
);

create table if not exists public.draft_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  step1 jsonb,
  step2 jsonb,
  step3 jsonb,
  step4 jsonb,
  step5 jsonb,
  last_completed_step integer default 0,
  updated_at timestamptz default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reference_id text unique not null,
  team_number integer unique not null,
  team_name text not null,
  team_size integer not null check (team_size between 4 and 6),
  is_svce boolean not null default false,
  college_name text,
  category text not null check (category in ('Hardware', 'Software', 'Industry Problem Statement')),
  problem_statement_id text,
  problem_statement_name text,
  company_name text,
  mentor_name text not null,
  mentor_department text,
  mentor_designation text,
  mentor_phone text,
  mentor_email text,
  payment_transaction_id text not null,
  payment_bank_name text not null,
  payment_mobile_number text not null,
  payment_account_holder_name text not null,
  payment_amount_confirmed boolean not null default false,
  payment_screenshot_url text,
  submission_status text not null default 'pending' check (submission_status in ('pending', 'verified', 'rejected')),
  ip_address text,
  user_agent text,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  unique_member_id text unique not null,
  team_id uuid not null references public.teams(id) on delete cascade,
  member_order integer not null check (member_order between 1 and 6),
  is_leader boolean not null default false,
  full_name text not null,
  department text not null,
  year_of_study text not null check (year_of_study in ('1st', '2nd', '3rd', '4th')),
  registration_number text,
  phone_number text not null,
  whatsapp_number text not null,
  college_email text not null,
  personal_email text not null,
  photo_url text,
  created_at timestamptz default now(),
  unique (team_id, member_order)
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id),
  event_type text not null,
  event_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email text,
  attempted_at timestamptz default now(),
  success boolean default false
);

create index if not exists idx_admin_attempts_email_time on public.admin_login_attempts(email, attempted_at desc);
create index if not exists idx_teams_status on public.teams(submission_status);
create index if not exists idx_teams_category on public.teams(category);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('member-photos', 'member-photos', false, 5242880, array['image/jpeg', 'image/png']),
  ('payment-screenshots', 'payment-screenshots', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']),
  ('payment-qr', 'payment-qr', true, 1048576, array['image/png', 'image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =========================
-- Auto-create profile on signup
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- Helper: is current user admin?
-- =========================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- =========================
-- ATOMIC SUBMISSION RPC
-- =========================
create or replace function public.submit_registration(
  p_team jsonb,
  p_members jsonb,
  p_ip text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid;
  v_team_number integer;
  v_reference_id text;
  v_category_code text;
  v_svce_flag text;
  v_member jsonb;
  v_unique_id text;
  v_member_order int;
  v_is_svce boolean;
  v_category text;
  v_members_out jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- prevent duplicate submission per user
  if exists (select 1 from public.teams where user_id = v_user_id) then
    raise exception 'You have already submitted a registration';
  end if;

  v_category := p_team->>'category';
  v_is_svce := (p_team->>'is_svce')::boolean;

  v_category_code := case v_category
    when 'Hardware' then 'hw'
    when 'Software' then 'sw'
    when 'Industry Problem Statement' then 'is'
    else null end;
  if v_category_code is null then
    raise exception 'Invalid category';
  end if;

  v_svce_flag := case when v_is_svce then '1' else '0' end;

  -- atomic team number
  v_team_number := nextval('team_number_seq');
  v_team_id := gen_random_uuid();
  v_reference_id := 'MAT7-' || upper(substring(v_team_id::text, 1, 8));

  insert into public.teams (
    id, user_id, reference_id, team_number, team_name, team_size, is_svce, college_name,
    category, problem_statement_id, problem_statement_name, company_name,
    mentor_name, mentor_department, mentor_designation, mentor_phone, mentor_email,
    payment_transaction_id, payment_bank_name, payment_mobile_number,
    payment_account_holder_name, payment_amount_confirmed, payment_screenshot_url,
    ip_address, user_agent
  ) values (
    v_team_id, v_user_id, v_reference_id, v_team_number,
    p_team->>'team_name',
    (p_team->>'team_size')::int,
    v_is_svce,
    p_team->>'college_name',
    v_category,
    p_team->>'problem_statement_id',
    p_team->>'problem_statement_name',
    p_team->>'company_name',
    p_team->>'mentor_name',
    p_team->>'mentor_department',
    p_team->>'mentor_designation',
    p_team->>'mentor_phone',
    p_team->>'mentor_email',
    p_team->>'payment_transaction_id',
    p_team->>'payment_bank_name',
    p_team->>'payment_mobile_number',
    p_team->>'payment_account_holder_name',
    coalesce((p_team->>'payment_amount_confirmed')::boolean, false),
    p_team->>'payment_screenshot_url',
    p_ip,
    p_user_agent
  );

  -- members loop
  for v_member_order in 1..jsonb_array_length(p_members) loop
    v_member := p_members->(v_member_order - 1);
    v_unique_id := v_category_code || v_svce_flag
                   || lpad(v_team_number::text, 2, '0')
                   || v_member_order::text;

    insert into public.members (
      unique_member_id, team_id, member_order, is_leader,
      full_name, department, year_of_study, registration_number,
      phone_number, whatsapp_number, college_email, personal_email, photo_url
    ) values (
      v_unique_id, v_team_id, v_member_order, (v_member_order = 1),
      v_member->>'full_name',
      v_member->>'department',
      v_member->>'year_of_study',
      v_member->>'registration_number',
      v_member->>'phone_number',
      v_member->>'whatsapp_number',
      v_member->>'college_email',
      v_member->>'personal_email',
      v_member->>'photo_url'
    );

    v_members_out := v_members_out || jsonb_build_object(
      'member_order', v_member_order,
      'full_name', v_member->>'full_name',
      'unique_member_id', v_unique_id
    );
  end loop;

  insert into public.audit_log (team_id, event_type, event_data, ip_address, user_agent)
  values (v_team_id, 'submission_created',
          jsonb_build_object('reference_id', v_reference_id, 'team_number', v_team_number),
          p_ip, p_user_agent);

  delete from public.draft_registrations where user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'reference_id', v_reference_id,
    'team_id', v_team_id,
    'team_number', v_team_number,
    'members_with_ids', v_members_out
  );
exception when others then
  raise exception 'Submission failed: %', sqlerrm;
end;
$$;

-- =========================
-- Admin lockout RPC
-- =========================
create or replace function public.check_admin_lockout(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_failed_count int;
  v_last_attempt timestamptz;
begin
  select count(*), max(attempted_at)
    into v_failed_count, v_last_attempt
  from public.admin_login_attempts
  where email = p_email
    and success = false
    and attempted_at > now() - interval '2 hours';

  if v_failed_count >= 3 then
    return jsonb_build_object('locked', true, 'unlock_at', v_last_attempt + interval '2 hours');
  end if;
  return jsonb_build_object('locked', false, 'failed_count', v_failed_count);
end;
$$;

create or replace function public.log_admin_attempt(p_email text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_login_attempts (user_id, email, success)
  values (auth.uid(), p_email, p_success);
end;
$$;

-- =========================
-- RLS
-- =========================
alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.draft_registrations enable row level security;
alter table public.teams enable row level security;
alter table public.members enable row level security;
alter table public.audit_log enable row level security;
alter table public.admin_login_attempts enable row level security;

-- user_profiles
drop policy if exists "users read own profile" on public.user_profiles;
create policy "users read own profile" on public.user_profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "users update own profile" on public.user_profiles;
create policy "users update own profile" on public.user_profiles
  for update using (auth.uid() = id);

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles
  for select using (auth.uid() = user_id or public.is_admin());

-- draft_registrations
drop policy if exists "drafts owner all" on public.draft_registrations;
create policy "drafts owner all" on public.draft_registrations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- teams
drop policy if exists "teams owner read" on public.teams;
create policy "teams owner read" on public.teams
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "teams admin update" on public.teams;
create policy "teams admin update" on public.teams
  for update using (public.is_admin());

-- members
drop policy if exists "members owner read" on public.members;
create policy "members owner read" on public.members
  for select using (
    public.is_admin()
    or exists (select 1 from public.teams t where t.id = team_id and t.user_id = auth.uid())
  );

-- audit_log
drop policy if exists "audit admin read" on public.audit_log;
create policy "audit admin read" on public.audit_log
  for select using (public.is_admin());

-- admin_login_attempts (admins read; everyone can insert via RPC only)
drop policy if exists "attempts admin read" on public.admin_login_attempts;
create policy "attempts admin read" on public.admin_login_attempts
  for select using (public.is_admin());

-- Grants for the RPCs (needed because they're security definer but called by anon/auth)
grant execute on function public.submit_registration(jsonb, jsonb, text, text) to authenticated;
grant execute on function public.check_admin_lockout(text) to anon, authenticated;
grant execute on function public.log_admin_attempt(text, boolean) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
