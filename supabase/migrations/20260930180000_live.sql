create type public.live_status as enum ('scheduled','live','ended','cancelled');

create table public.live_streams (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 150),
  description text,
  status public.live_status not null default 'scheduled',
  playback_id text,
  provider_stream_id text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  viewer_count integer not null default 0 check(viewer_count >= 0),
  created_at timestamptz not null default now()
);

create table public.live_comments (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.live_streams(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.live_reactions (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.live_streams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null check(reaction in ('like','heart','clap','fire')),
  created_at timestamptz not null default now()
);

create table public.live_gifts (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.live_streams(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  gift_code text not null,
  amount numeric(12,2) not null check(amount > 0),
  currency text not null default 'USD',
  status text not null default 'pending' check(status in ('pending','completed','failed','refunded')),
  created_at timestamptz not null default now()
);

create table public.live_reports (
  id uuid primary key default gen_random_uuid(),
  stream_id uuid not null references public.live_streams(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table public.live_moderators (
  stream_id uuid not null references public.live_streams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(stream_id,user_id)
);

alter table public.live_streams enable row level security;
alter table public.live_comments enable row level security;
alter table public.live_reactions enable row level security;
alter table public.live_gifts enable row level security;
alter table public.live_reports enable row level security;
alter table public.live_moderators enable row level security;

create policy "live streams discoverable" on public.live_streams for select using(true);
create policy "creators create streams" on public.live_streams for insert to authenticated with check(auth.uid()=creator_id);
create policy "creators manage streams" on public.live_streams for update to authenticated using(auth.uid()=creator_id) with check(auth.uid()=creator_id);
create policy "live comments readable" on public.live_comments for select using(true);
create policy "users comment live" on public.live_comments for insert to authenticated with check(auth.uid()=author_id);
create policy "live reactions readable" on public.live_reactions for select using(true);
create policy "users react live" on public.live_reactions for insert to authenticated with check(auth.uid()=user_id);
create policy "gift participants read gifts" on public.live_gifts for select to authenticated using(auth.uid()=sender_id or auth.uid()=creator_id);
create policy "users read own reports" on public.live_reports for select to authenticated using(auth.uid()=reporter_id);
create policy "users report streams" on public.live_reports for insert to authenticated with check(auth.uid()=reporter_id);
create policy "stream creator reads moderators" on public.live_moderators for select to authenticated using(exists(select 1 from public.live_streams s where s.id=stream_id and s.creator_id=auth.uid()) or auth.uid()=user_id);
create policy "stream creator adds moderators" on public.live_moderators for insert to authenticated with check(exists(select 1 from public.live_streams s where s.id=stream_id and s.creator_id=auth.uid()));

create index live_streams_status_idx on public.live_streams(status,created_at desc);
create index live_comments_stream_idx on public.live_comments(stream_id,created_at);
