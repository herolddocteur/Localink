create table public.roll_calls (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 country_code text not null, region text, city text, local_area text, message text,
 created_at timestamptz not null default now()
);
create table public.reconnect_posts (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id) on delete cascade,
 person_name text not null, last_known_country text, last_known_region text, last_known_city text,
 relationship text, message text not null, photo_url text, status text not null default 'active' check(status in ('active','reconnected','closed')),
 created_at timestamptz not null default now()
);
create table public.missing_people_posts (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
 person_name text not null, age integer check(age is null or age between 0 and 130), photo_url text,
 last_seen_date date, last_seen_country text, last_seen_region text, last_seen_city text,
 description text, official_case_reference text, official_contact text,
 verification_status text not null default 'unverified' check(verification_status in ('unverified','pending','verified','rejected')),
 status text not null default 'missing' check(status in ('missing','found','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.people_hub_reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
 content_type text not null check(content_type in ('roll_call','reconnect','missing_person')), content_id uuid not null,
 reason text not null, details text, status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
 created_at timestamptz not null default now()
);
alter table public.roll_calls enable row level security; alter table public.reconnect_posts enable row level security; alter table public.missing_people_posts enable row level security; alter table public.people_hub_reports enable row level security;
create policy "roll calls readable" on public.roll_calls for select using(true); create policy "users create own roll call" on public.roll_calls for insert to authenticated with check(user_id=auth.uid()); create policy "users manage own roll call" on public.roll_calls for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "reconnect posts readable" on public.reconnect_posts for select using(true); create policy "users create reconnect posts" on public.reconnect_posts for insert to authenticated with check(author_id=auth.uid()); create policy "users manage reconnect posts" on public.reconnect_posts for update to authenticated using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy "missing posts readable" on public.missing_people_posts for select using(status in ('missing','found')); create policy "users create missing posts" on public.missing_people_posts for insert to authenticated with check(reporter_id=auth.uid()); create policy "reporters manage missing posts" on public.missing_people_posts for update to authenticated using(reporter_id=auth.uid()) with check(reporter_id=auth.uid());
create policy "users submit people hub reports" on public.people_hub_reports for insert to authenticated with check(reporter_id=auth.uid()); create policy "users read own reports" on public.people_hub_reports for select to authenticated using(reporter_id=auth.uid());
create index roll_calls_location_idx on public.roll_calls(country_code,region,city,created_at desc); create index reconnect_location_idx on public.reconnect_posts(last_known_country,last_known_region,last_known_city,created_at desc); create index missing_people_location_idx on public.missing_people_posts(last_seen_country,last_seen_region,last_seen_city,status,created_at desc);
create trigger missing_people_set_updated_at before update on public.missing_people_posts for each row execute function public.set_updated_at();
