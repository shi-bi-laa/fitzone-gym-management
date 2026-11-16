-- FitZone schema for Supabase. Paste this whole file into:
-- Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to run more than once.

create table if not exists public.members (
  seq        bigint generated always as identity (start with 1001) primary key,
  id         text generated always as ('FZ' || seq::text) stored unique,
  name       text not null,
  email      text not null default '',
  phone      text not null default '',
  gender     text not null default 'Male',
  plan       text not null default 'Monthly Flex',
  joined     text not null,
  expiry     text not null,
  status     text not null default 'Active' check (status in ('Active','Expiring','Expired','Inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id           uuid primary key default gen_random_uuid(),
  member_id    text not null references public.members(id) on update cascade,
  work_date    date not null,
  check_in_at  timestamptz not null default now(),
  check_out_at timestamptz,
  method       text not null default 'Manual' check (method in ('Manual','QR'))
);

create index if not exists idx_attendance_date on public.attendance(work_date);
-- A member can only have one open (not checked-out) visit per day.
create unique index if not exists uq_attendance_open
  on public.attendance(member_id, work_date) where check_out_at is null;

-- Lock the tables: the public "anon" key can NOT read or write them.
-- Only the Cloudflare Worker (using the secret key) can.
alter table public.members    enable row level security;
alter table public.attendance enable row level security;

-- Optional demo members (delete these lines if you want to start empty)
insert into public.members (name,email,phone,gender,plan,joined,expiry,status)
select * from (values
 ('Aarav Sharma','aarav.sharma@email.com','+91 98765 43210','Male','Annual Fitness','12 Jan 2026','12 Jan 2027','Active'),
 ('Ananya Nair','ananya.nair@email.com','+91 98765 12340','Female','Quarterly Pro','18 Aug 2026','18 Nov 2026','Expiring'),
 ('Rohan Mehta','rohan.mehta@email.com','+91 99887 66554','Male','Monthly Flex','02 Nov 2026','02 Dec 2026','Active'),
 ('Priya Menon','priya.menon@email.com','+91 98470 12345','Female','Annual Fitness','05 Mar 2026','05 Mar 2027','Active')
) as v(name,email,phone,gender,plan,joined,expiry,status)
where not exists (select 1 from public.members);
