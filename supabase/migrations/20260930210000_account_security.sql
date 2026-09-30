alter table public.profiles add column if not exists last_active_at timestamptz not null default now(), add column if not exists deletion_scheduled_at timestamptz, add column if not exists account_status text not null default 'active' check(account_status in ('active','inactive_warning','deletion_pending','suspended','deleted'));
create table public.user_blocks(blocker_id uuid not null references public.profiles(id) on delete cascade,blocked_id uuid not null references public.profiles(id) on delete cascade,created_at timestamptz not null default now(),primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create table public.account_reports(id uuid primary key default gen_random_uuid(),reporter_id uuid not null references public.profiles(id) on delete cascade,reported_user_id uuid references public.profiles(id) on delete set null,reason text not null,details text,status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),created_at timestamptz not null default now());
create table public.security_events(id bigint generated always as identity primary key,user_id uuid not null references public.profiles(id) on delete cascade,event_type text not null,device_label text,ip_hash text,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table public.account_lifecycle_actions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,action text not null check(action in ('inactivity_warning','deletion_scheduled','deletion_cancelled','balance_escalation','account_deleted')),scheduled_for timestamptz,status text not null default 'pending' check(status in ('pending','completed','cancelled','failed')),created_at timestamptz not null default now());
alter table public.user_blocks enable row level security;alter table public.account_reports enable row level security;alter table public.security_events enable row level security;alter table public.account_lifecycle_actions enable row level security;
create policy "users manage own blocks" on public.user_blocks for all to authenticated using(blocker_id=auth.uid()) with check(blocker_id=auth.uid());
create policy "users submit reports" on public.account_reports for insert to authenticated with check(reporter_id=auth.uid());create policy "users read own reports" on public.account_reports for select to authenticated using(reporter_id=auth.uid());
create policy "users read own security events" on public.security_events for select to authenticated using(user_id=auth.uid());create policy "users read own lifecycle" on public.account_lifecycle_actions for select to authenticated using(user_id=auth.uid());
create index profiles_inactivity_idx on public.profiles(account_status,last_active_at);create index security_events_user_idx on public.security_events(user_id,created_at desc);

-- Accounts inactive for 90 days enter a deletion workflow instead of being immediately destroyed.
-- Any remaining wallet balance is NOT transferred automatically to Localink. It must be handled by the compliant funds/unclaimed-property workflow before deletion.
create or replace function public.flag_inactive_accounts() returns integer language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 update public.profiles set account_status='inactive_warning',deletion_scheduled_at=now()+interval '30 days'
 where account_status='active' and last_active_at < now()-interval '90 days';
 get diagnostics n=row_count;
 insert into public.account_lifecycle_actions(user_id,action,scheduled_for)
 select id,'deletion_scheduled',deletion_scheduled_at from public.profiles p
 where p.account_status='inactive_warning' and not exists(select 1 from public.account_lifecycle_actions a where a.user_id=p.id and a.action='deletion_scheduled' and a.status='pending');
 return n;
end;$$;
