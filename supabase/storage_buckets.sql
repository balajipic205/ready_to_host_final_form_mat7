-- =====================================================================
-- Make-a-Thon 7.0 — Storage Buckets + Policies
-- Run this ONCE in Supabase SQL Editor.
-- This creates the 3 buckets and the RLS policies needed for uploads.
-- =====================================================================

-- 1. Create the buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('member-photos',       'member-photos',       false, 1048576,  array['image/jpeg','image/png']),
  ('payment-screenshots', 'payment-screenshots', false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('payment-qr',          'payment-qr',          true,  1048576,  array['image/png','image/jpeg'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Drop old policies (safe re-run)
drop policy if exists "Auth upload member photos"        on storage.objects;
drop policy if exists "Auth read own member photos"      on storage.objects;
drop policy if exists "Auth delete own member photos"    on storage.objects;
drop policy if exists "Auth upload payment screenshots"  on storage.objects;
drop policy if exists "Auth read own payment screenshots" on storage.objects;
drop policy if exists "Auth delete own payment screenshots" on storage.objects;
drop policy if exists "Admin read all member photos"     on storage.objects;
drop policy if exists "Admin read all payment screenshots" on storage.objects;
drop policy if exists "Public read payment QR"           on storage.objects;

-- 3. Member photos — user can upload/read/delete inside their own folder (auth.uid())
create policy "Auth upload member photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Auth read own member photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Auth delete own member photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Payment screenshots — same pattern
create policy "Auth upload payment screenshots" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Auth read own payment screenshots" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Auth delete own payment screenshots" on storage.objects
  for delete to authenticated
  using (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

-- 5. Admins can read everything in private buckets
create policy "Admin read all member photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'member-photos' and public.has_role(auth.uid(), 'admin'));

create policy "Admin read all payment screenshots" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-screenshots' and public.has_role(auth.uid(), 'admin'));

-- 6. Public can read the payment QR
create policy "Public read payment QR" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'payment-qr');

-- ✅ Done. Now upload your QR image to the `payment-qr` bucket as `qr.png`.
