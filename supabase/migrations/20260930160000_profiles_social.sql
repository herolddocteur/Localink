alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists verification_type text,
  add column if not exists website text;

create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_city_idx on public.profiles(country_code, region, city);
