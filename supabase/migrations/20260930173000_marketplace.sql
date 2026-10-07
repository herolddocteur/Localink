alter table public.marketplace_listings
  add column if not exists pickup_only boolean not null default true,
  add column if not exists condition text,
  add column if not exists primary_image_url text;

create table public.marketplace_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.marketplace_saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,listing_id)
);

alter table public.marketplace_listing_images enable row level security;
alter table public.marketplace_saved_items enable row level security;
create policy "listing images readable" on public.marketplace_listing_images for select using(true);
create policy "seller manages listing images" on public.marketplace_listing_images for insert to authenticated with check(exists(select 1 from public.marketplace_listings l where l.id=listing_id and l.seller_id=auth.uid()));
create policy "saved items private" on public.marketplace_saved_items for select to authenticated using(auth.uid()=user_id);
create policy "users save items" on public.marketplace_saved_items for insert to authenticated with check(auth.uid()=user_id);
create policy "users unsave items" on public.marketplace_saved_items for delete to authenticated using(auth.uid()=user_id);
create index marketplace_saved_user_idx on public.marketplace_saved_items(user_id,created_at desc);
