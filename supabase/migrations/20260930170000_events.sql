create type public.event_rsvp_status as enum ('going','interested','not_going');

create table public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.event_rsvp_status not null,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(event_id,user_id)
);

create table public.event_discussion (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.event_rsvps enable row level security;
alter table public.event_discussion enable row level security;
create policy "event rsvps readable" on public.event_rsvps for select using(true);
create policy "users manage own rsvp" on public.event_rsvps for insert to authenticated with check(auth.uid()=user_id);
create policy "users update own rsvp" on public.event_rsvps for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "users delete own rsvp" on public.event_rsvps for delete to authenticated using(auth.uid()=user_id);
create policy "event discussion readable" on public.event_discussion for select using(true);
create policy "users post event discussion" on public.event_discussion for insert to authenticated with check(auth.uid()=author_id);
create policy "users delete own event discussion" on public.event_discussion for delete to authenticated using(auth.uid()=author_id);
create trigger event_rsvps_set_updated_at before update on public.event_rsvps for each row execute function public.set_updated_at();
create index event_rsvps_event_idx on public.event_rsvps(event_id,status);
create index event_discussion_event_idx on public.event_discussion(event_id,created_at);
