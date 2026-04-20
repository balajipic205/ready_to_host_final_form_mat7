# Make-a-Thon 7.0 — Setup Guide

## SQL Run Order (in Supabase SQL Editor)

Run these files **in this exact order**. Each is safe to re-run.

1. **`supabase/schema.sql`** — tables, types, RPCs, RLS, storage buckets
2. **`supabase/storage_buckets.sql`** — storage RLS policies for the buckets
3. **`supabase/patch_v2.sql`** — adds `record_admin_login_attempt` RPC + tightens bucket size limits to match the UI (1 MB photos, 2 MB screenshots)
4. **`supabase/make_admin.sql`** — open it, replace `PASTE-YOUR-USER-UUID-HERE` with your `auth.users` UUID, then run

To find your UUID:
```sql
select id, email from auth.users;
```

## Storage Setup

After running the SQL, **upload your payment QR** to the `payment-qr` bucket as `qr.png`
(Storage → payment-qr → Upload).

## File size policy (enforced in UI + buckets)

- Member photos: source ≤ 5 MB → auto-cropped & compressed to **400–950 KB**
- Payment screenshot: **1–2 MB** (JPG / PNG / PDF)

## Admin login lockout

3 wrong password attempts within a 2-hour window locks that email for 2 hours.

## User flow

- New user → `/login` → `/register` → 6-step wizard → `/success`
- Returning user (already submitted) → `/login` → `/my-team` (read-only summary with "do not resubmit, contact us" note)
- Admin → `/login` → `/admin/dashboard`
