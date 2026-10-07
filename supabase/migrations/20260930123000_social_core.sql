create type public.post_visibility as enum ('public','followers','friends','private');
create type public.notification_type as enum ('follow','like','comment','mention','message','system');

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text check (char_length(body) <= 5000),
  media_url text,
  media_type text check (media_type is null or media_type in ('image','video','audio')),
  visibility public.post_visibility not null default 'public',
  country_code text,
  region text,
  city text,
  local_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts(created_at desc);
create index posts_city_created_at_idx on public.posts(country_code, region, city, created_at desc);
create index follows_following_idx on public.follows(following_id, follower_id);
create index comments_post_idx on public.comments(post_id, created_at);
create index notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

create policy "follows readable" on public.follows for select using (true);
create policy "users follow from own account" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "users unfollow from own account" on public.follows for delete to authenticated using (auth.uid() = follower_id);

create policy "visible posts readable" on public.posts for select using (
  author_id = auth.uid()
  or visibility = 'public'
  or (visibility = 'followers' and exists (
    select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = author_id
  ))
);
create policy "users create own posts" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own posts" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own posts" on public.posts for delete to authenticated using (auth.uid() = author_id);

create policy "likes readable" on public.post_likes for select using (true);
create policy "users like as self" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "users unlike as self" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create policy "comments readable" on public.comments for select using (exists (select 1 from public.posts p where p.id = post_id));
create policy "users comment as self" on public.comments for insert to authenticated with check (auth.uid() = author_id);
create policy "users update own comments" on public.comments for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own comments" on public.comments for delete to authenticated using (auth.uid() = author_id);

create policy "users read own notifications" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
create trigger comments_set_updated_at before update on public.comments for each row execute function public.set_updated_at();
