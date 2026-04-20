-- =====================================================================
-- Promote a user to ADMIN
-- Run this ONLY AFTER you have run schema.sql successfully.
-- Replace the UUID below with YOUR user id from auth.users.
--
-- To find your id:    select id, email from auth.users;
-- =====================================================================

insert into public.user_roles (user_id, role)
values ('PASTE-YOUR-USER-UUID-HERE', 'admin')
on conflict (user_id, role) do nothing;

-- Verify:
select u.email, r.role
from public.user_roles r
join auth.users u on u.id = r.user_id
where r.role = 'admin';
