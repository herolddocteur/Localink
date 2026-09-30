create type public.community_access as enum ('public','private','approval','paid');

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  description text,
  category text,
  access public.community_access not null default 'public',
  membership_price numeric(10,2) not null default 0 check (membership_price >= 0),
  country_code text,
  region text,
  city text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  starts_at timestamptz not null,
  country_code text,
  region text,
  city text,
  venue_name text,
  created_at timestamptz not null default now()
);

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD',
  country_code text,
  region text,
  city text,
  status text not null default 'active' check (status in ('active','sold','paused','removed')),
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;
alter table public.events enable row level security;
alter table public.marketplace_listings enable row level security;

create policy "communities discoverable" on public.communities for select using (true);
create policy "owners create communities" on public.communities for insert to authenticated with check (auth.uid() = owner_id);
create policy "owners manage communities" on public.communities for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "events discoverable" on public.events for select using (true);
create policy "creators create events" on public.events for insert to authenticated with check (auth.uid() = creator_id);
create policy "creators manage events" on public.events for update to authenticated using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

create policy "active listings discoverable" on public.marketplace_listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "sellers create listings" on public.marketplace_listings for insert to authenticated with check (auth.uid() = seller_id);
create policy "sellers manage listings" on public.marketplace_listings for update to authenticated using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

create index communities_location_idx on public.communities(country_code, region, city);
create index events_location_date_idx on public.events(country_code, region, city, starts_at);
create index marketplace_location_idx on public.marketplace_listings(country_code, region, city, created_at desc);
