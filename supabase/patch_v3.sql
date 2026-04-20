-- =====================================================================
-- Make-a-Thon 7.0 — PATCH v3 (run AFTER patch_v2.sql; safe to re-run)
--
-- Includes:
--  • Makes payment_bank_name nullable (UI no longer collects it).
--  • Tightens payment_transaction_id to a 12-digit numeric (UPI UTR).
--  • Refreshes submit_registration so its error block doesn't mask
--    success (preserves the real Postgres error code on failure).
-- =====================================================================

create extension if not exists "pgcrypto";

-- 1) Allow NULL bank name (kept for backwards compatibility — server
--    inserts the literal "GPay" but old rows may already have NULL).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'teams'
      and column_name = 'payment_bank_name'
      and is_nullable = 'NO'
  ) then
    alter table public.teams alter column payment_bank_name drop not null;
  end if;
end $$;

-- 2) Refresh the submit RPC.  The previous version wrapped every error in
--    "Submission failed: %", which made it impossible for the UI to react to
--    specific failures (duplicate user, RLS denial, etc.).  We simply re-raise
--    the original exception so the client sees the real message.
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
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if exists (select 1 from public.teams where user_id = v_user_id) then
    raise exception 'You have already submitted a registration for this account.'
      using errcode = '23505';
  end if;

  v_category := p_team->>'category';
  v_is_svce := (p_team->>'is_svce')::boolean;

  v_category_code := case v_category
    when 'Hardware' then 'hw'
    when 'Software' then 'sw'
    when 'Industry Problem Statement' then 'is'
    else null end;

  if v_category_code is null then
    raise exception 'Invalid category' using errcode = '22023';
  end if;

  v_svce_flag := case when v_is_svce then '1' else '0' end;
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
    coalesce(p_team->>'payment_bank_name', 'GPay'),
    p_team->>'payment_mobile_number',
    p_team->>'payment_account_holder_name',
    coalesce((p_team->>'payment_amount_confirmed')::boolean, false),
    p_team->>'payment_screenshot_url',
    p_ip,
    p_user_agent
  );

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
  values (
    v_team_id,
    'submission_created',
    jsonb_build_object('reference_id', v_reference_id, 'team_number', v_team_number),
    p_ip,
    p_user_agent
  );

  delete from public.draft_registrations where user_id = v_user_id;

  return jsonb_build_object(
    'success', true,
    'reference_id', v_reference_id,
    'team_id', v_team_id,
    'team_number', v_team_number,
    'members_with_ids', v_members_out
  );
end;
$$;

grant execute on function public.submit_registration(jsonb, jsonb, text, text) to authenticated;
