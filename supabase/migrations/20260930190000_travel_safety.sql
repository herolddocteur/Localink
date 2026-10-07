create type public.safety_session_type as enum ('check_in','timer');
create type public.safety_session_status as enum ('active','completed','expired','cancelled');

create table public.travel_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination_country text,
  destination_region text,
  destination_city text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  share_with text not null default 'only_me' check(share_with in ('only_me','friends','selected')),
  arrival_notification boolean not null default false,
  pause_on_arrival boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.safety_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_type public.safety_session_type not null,
  status public.safety_session_status not null default 'active',
  ends_at timestamptz,
  message text,
  audience text not null default 'selected' check(audience in ('friends','selected')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.public_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null check(alert_type in ('airport','flight','immigration','traffic','public_safety','weather','other')),
  title text not null,
  body text,
  source_name text,
  source_url text,
  verified_source boolean not null default false,
  country_code text,
  region text,
  city text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.travel_plans enable row level security;
alter table public.safety_sessions enable row level security;
alter table public.public_alerts enable row level security;
create policy "users manage own travel plans" on public.travel_plans for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "users manage own safety sessions" on public.safety_sessions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "public alerts readable" on public.public_alerts for select using(expires_at is null or expires_at>now());
create index public_alerts_location_idx on public.public_alerts(country_code,region,city,alert_type,created_at desc);
create index safety_sessions_active_idx on public.safety_sessions(user_id,status,ends_at);
