create type public.community_role as enum ('owner','admin','moderator','member');
create type public.membership_status as enum ('pending','active','rejected','cancelled');

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.community_role not null default 'member',
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.creator_wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available_balance numeric(12,2) not null default 0 check (available_balance >= 0),
  pending_balance numeric(12,2) not null default 0 check (pending_balance >= 0),
  currency text not null default 'USD',
  updated_at timestamptz not null default now()
);

create table public.community_membership_payments (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  provider text,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at timestamptz not null default now()
);

create table public.creator_withdrawals (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  gross_amount numeric(12,2) not null check (gross_amount > 0),
  platform_fee numeric(12,2) generated always as (round(gross_amount * 0.05, 2)) stored,
  net_amount numeric(12,2) generated always as (round(gross_amount * 0.95, 2)) stored,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','processing','paid','failed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.community_members enable row level security;
alter table public.creator_wallets enable row level security;
alter table public.community_membership_payments enable row level security;
alter table public.creator_withdrawals enable row level security;

create policy "memberships visible to member or community owner" on public.community_members for select to authenticated using (
  auth.uid() = user_id or exists (select 1 from public.communities c where c.id = community_id and c.owner_id = auth.uid())
);
create policy "users request membership as self" on public.community_members for insert to authenticated with check (auth.uid() = user_id and role = 'member');
create policy "community owners manage membership" on public.community_members for update to authenticated using (
  exists (select 1 from public.communities c where c.id = community_id and c.owner_id = auth.uid())
);

create policy "creator reads own wallet" on public.creator_wallets for select to authenticated using (auth.uid() = user_id);
create policy "member or creator reads payment" on public.community_membership_payments for select to authenticated using (auth.uid() = member_id or auth.uid() = creator_id);
create policy "creator reads own withdrawals" on public.creator_withdrawals for select to authenticated using (auth.uid() = creator_id);
create policy "creator requests own withdrawal" on public.creator_withdrawals for insert to authenticated with check (auth.uid() = creator_id);

create trigger creator_wallets_set_updated_at before update on public.creator_wallets for each row execute function public.set_updated_at();
