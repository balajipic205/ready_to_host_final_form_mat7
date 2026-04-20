-- =====================================================================
-- Make-a-Thon 7.0 — Admin lockout RPCs
-- Run this AFTER schema.sql in the Supabase SQL Editor.
-- Adds two RPCs and tightens admin_login_attempts policies.
-- =====================================================================

-- Make sure the table exists (no-op if already created in schema.sql)
create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  attempted_at timestamptz default now(),
  success boolean default false
);

alter table public.admin_login_attempts enable row level security;

-- Anyone (including anon) is allowed to INSERT an attempt — but only via
-- the security-definer RPCs below. The table itself is not directly readable.
drop policy if exists "no_select_attempts" on public.admin_login_attempts;
create policy "no_select_attempts" on public.admin_login_attempts
  for select using (false);

drop policy if exists "no_insert_attempts" on public.admin_login_attempts;
create policy "no_insert_attempts" on public.admin_login_attempts
  for insert with check (false);

-- =========================
-- RPC: check_admin_lockout(email)
-- Returns { locked: boolean, retry_after_minutes: int, fails: int }
-- Lockout rule: if there are 3+ FAILED attempts for this email in the
-- last 2 hours AND no successful attempt newer than the latest fail,
-- the account is locked.
-- =========================
create or replace function public.check_admin_lockout(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz := now() - interval '2 hours';
  v_fail_count int;
  v_last_fail timestamptz;
  v_last_success timestamptz;
  v_retry_minutes int;
begin
  select count(*), max(attempted_at)
    into v_fail_count, v_last_fail
    from public.admin_login_attempts
   where lower(email) = lower(p_email)
     and success = false
     and attempted_at >= v_window_start;

  select max(attempted_at) into v_last_success
    from public.admin_login_attempts
   where lower(email) = lower(p_email)
     and success = true
     and attempted_at >= v_window_start;

  if v_fail_count >= 3 and (v_last_success is null or v_last_success < v_last_fail) then
    v_retry_minutes := greatest(
      0,
      ceil(extract(epoch from ((v_last_fail + interval '2 hours') - now())) / 60)::int
    );
    return jsonb_build_object(
      'locked', true,
      'retry_after_minutes', v_retry_minutes,
      'fails', v_fail_count
    );
  end if;

  return jsonb_build_object(
    'locked', false,
    'retry_after_minutes', 0,
    'fails', coalesce(v_fail_count, 0)
  );
end;
$$;

grant execute on function public.check_admin_lockout(text) to anon, authenticated;

-- =========================
-- RPC: record_admin_login_attempt(email, success)
-- Inserts a row even from anon clients, bypassing RLS via SECURITY DEFINER.
-- =========================
create or replace function public.record_admin_login_attempt(p_email text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_login_attempts (email, success, user_id)
  values (lower(p_email), coalesce(p_success, false), auth.uid());
end;
$$;

grant execute on function public.record_admin_login_attempt(text, boolean) to anon, authenticated;
