create type public.conversation_type as enum ('direct','group');
create type public.message_kind as enum ('text','image','video','audio','file','system');
create type public.message_request_status as enum ('none','pending','accepted','declined');

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null default 'direct',
  title text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  request_status public.message_request_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  muted_until timestamptz,
  primary key (conversation_id,user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  kind public.message_kind not null default 'text',
  body text,
  media_url text,
  reply_to_id uuid references public.messages(id) on delete set null,
  edited_at timestamptz,
  recalled_at timestamptz,
  created_at timestamptz not null default now(),
  check (body is not null or media_url is not null)
);

create index messages_conversation_created_idx on public.messages(conversation_id,created_at desc);
create index conversation_members_user_idx on public.conversation_members(user_id,conversation_id);

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy "members read conversations" on public.conversations for select to authenticated using (
  exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid())
);
create policy "authenticated users create conversations" on public.conversations for insert to authenticated with check (auth.uid()=created_by);

create policy "members read memberships" on public.conversation_members for select to authenticated using (
  exists(select 1 from public.conversation_members mine where mine.conversation_id=conversation_id and mine.user_id=auth.uid())
);
create policy "conversation creator adds members" on public.conversation_members for insert to authenticated with check (
  exists(select 1 from public.conversations c where c.id=conversation_id and c.created_by=auth.uid()) or user_id=auth.uid()
);

create policy "members read messages" on public.messages for select to authenticated using (
  exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid())
);
create policy "members send messages" on public.messages for insert to authenticated with check (
  sender_id=auth.uid() and exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid())
);
create policy "sender edits within two minutes" on public.messages for update to authenticated using (
  sender_id=auth.uid() and created_at >= now()-interval '2 minutes'
) with check (sender_id=auth.uid());

create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
