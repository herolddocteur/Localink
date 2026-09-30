create type public.map_item_type as enum ('post','event','marketplace','business','traffic','safety');

create table public.map_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references public.profiles(id) on delete set null,
  item_type public.map_item_type not null,
  source_id uuid,
  title text not null,
  description text,
  country_code text,
  region text,
  city text,
  local_area text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  location_precision text not null default 'approximate' check(location_precision in ('city','approximate','precise')),
  verified_source boolean not null default false,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table public.location_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_location_enabled boolean not null default false,
  precise_location_enabled boolean not null default false,
  background_location_enabled boolean not null default false,
  public_visibility text not null default 'hidden' check(public_visibility in ('only_me','friends','communities','everyone','hidden')),
  travel_mode_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.map_items enable row level security;
alter table public.location_preferences enable row level security;
create policy "active map items readable" on public.map_items for select using(expires_at is null or expires_at > now());
create policy "users create map items" on public.map_items for insert to authenticated with check(creator_id=auth.uid());
create policy "users manage own map items" on public.map_items for update to authenticated using(creator_id=auth.uid()) with check(creator_id=auth.uid());
create policy "users read own location preferences" on public.location_preferences for select to authenticated using(user_id=auth.uid());
create policy "users create own location preferences" on public.location_preferences for insert to authenticated with check(user_id=auth.uid());
create policy "users update own location preferences" on public.location_preferences for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create index map_items_location_idx on public.map_items(country_code,region,city,item_type,created_at desc);
create index map_items_expiry_idx on public.map_items(expires_at);
create trigger location_preferences_set_updated_at before update on public.location_preferences for each row execute function public.set_updated_at();
