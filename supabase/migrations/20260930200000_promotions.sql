create type public.promotion_status as enum ('draft','pending','active','paused','completed','rejected');
create type public.promotion_objective as enum ('views','engagement','followers','messages','sales','event_attendance','website_visits');

create table public.promotion_campaigns (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
 content_type text not null check(content_type in ('post','video','product','event','business','profile')),
 content_id uuid, objective public.promotion_objective not null, status public.promotion_status not null default 'draft',
 budget numeric(12,2) not null check(budget > 0), daily_budget numeric(12,2) check(daily_budget is null or daily_budget > 0), currency text not null default 'USD',
 starts_at timestamptz, ends_at timestamptz,
 target_country text, target_region text, target_city text, target_age_min integer check(target_age_min is null or target_age_min >= 13), target_age_max integer check(target_age_max is null or target_age_max <= 120),
 target_interests text[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.promotion_metrics (
 campaign_id uuid primary key references public.promotion_campaigns(id) on delete cascade,
 impressions bigint not null default 0, reach bigint not null default 0, clicks bigint not null default 0,
 engagements bigint not null default 0, messages bigint not null default 0, conversions bigint not null default 0,
 spend numeric(12,2) not null default 0, updated_at timestamptz not null default now()
);
create table public.promotion_events (
 id bigint generated always as identity primary key, campaign_id uuid not null references public.promotion_campaigns(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete set null, event_type text not null check(event_type in ('impression','click','engagement','message','conversion')),
 created_at timestamptz not null default now()
);
alter table public.promotion_campaigns enable row level security; alter table public.promotion_metrics enable row level security; alter table public.promotion_events enable row level security;
create policy "owners read campaigns" on public.promotion_campaigns for select to authenticated using(owner_id=auth.uid());
create policy "owners create campaigns" on public.promotion_campaigns for insert to authenticated with check(owner_id=auth.uid());
create policy "owners update campaigns" on public.promotion_campaigns for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "owners read campaign metrics" on public.promotion_metrics for select to authenticated using(exists(select 1 from public.promotion_campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
create index promotion_campaign_owner_idx on public.promotion_campaigns(owner_id,status,created_at desc); create index promotion_events_campaign_idx on public.promotion_events(campaign_id,created_at desc);
create trigger promotion_campaigns_set_updated_at before update on public.promotion_campaigns for each row execute function public.set_updated_at();
