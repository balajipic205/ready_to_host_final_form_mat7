-- =====================================================================
-- Make-a-Thon 7.0 — Storage Policies
-- PRE-REQ: Create these 3 buckets in Storage UI first:
--   1) member-photos       (private, 5 MB,  image/jpeg, image/png)
--   2) payment-screenshots (private, 10 MB, image/jpeg, image/png, application/pdf)
--   3) payment-qr          (PUBLIC,  no limit needed) -> upload qr.png
-- Then run this file.
-- =====================================================================

-- member-photos: authenticated users can write to their own folder; admins can read all; owners read own
drop policy if exists "member-photos owner write" on storage.objects;
create policy "member-photos owner write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "member-photos owner update" on storage.objects;
create policy "member-photos owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "member-photos owner delete" on storage.objects;
create policy "member-photos owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'member-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "member-photos owner+admin read" on storage.objects;
create policy "member-photos owner+admin read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'member-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- payment-screenshots: same pattern
drop policy if exists "payment-ss owner write" on storage.objects;
create policy "payment-ss owner write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "payment-ss owner update" on storage.objects;
create policy "payment-ss owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'payment-screenshots' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "payment-ss owner+admin read" on storage.objects;
create policy "payment-ss owner+admin read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-screenshots'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- payment-qr: public read (bucket itself is public, but explicit policy doesn't hurt)
drop policy if exists "payment-qr public read" on storage.objects;
create policy "payment-qr public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'payment-qr');
