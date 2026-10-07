create type public.vip_status as enum ('active','past_due','cancelled','expired');
create table public.vip_memberships (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 status public.vip_status not null default 'active', plan_code text not null default 'vip_monthly',
 provider_customer_id text, provider_subscription_id text, started_at timestamptz not null default now(),
 renews_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vip_live_rooms (
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, description text, stream_id uuid references public.live_streams(id) on delete set null,
 access_level text not null default 'vip' check(access_level in ('vip','invite_only')), created_at timestamptz not null default now()
);
create table public.vip_support_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 subject text not null, body text not null, status text not null default 'open' check(status in ('open','in_progress','resolved','closed')),
 priority text not null default 'vip', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.vip_memberships enable row level security; alter table public.vip_live_rooms enable row level security; alter table public.vip_support_requests enable row level security;
create policy "users read own vip" on public.vip_memberships for select to authenticated using(user_id=auth.uid());
create policy "active vip reads vip rooms" on public.vip_live_rooms for select to authenticated using(exists(select 1 from public.vip_memberships v where v.user_id=auth.uid() and v.status='active'));
create policy "vip creators create rooms" on public.vip_live_rooms for insert to authenticated with check(creator_id=auth.uid() and exists(select 1 from public.vip_memberships v where v.user_id=auth.uid() and v.status='active'));
create policy "users read own vip support" on public.vip_support_requests for select to authenticated using(user_id=auth.uid());
create policy "active vip creates support" on public.vip_support_requests for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.vip_memberships v where v.user_id=auth.uid() and v.status='active'));
create trigger vip_memberships_set_updated_at before update on public.vip_memberships for each row execute function public.set_updated_at();
create trigger vip_support_set_updated_at before update on public.vip_support_requests for each row execute function public.set_updated_at();
