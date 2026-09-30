create table public.conversation_typing (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  primary key (conversation_id,user_id)
);

alter table public.conversation_typing enable row level security;
create policy "members see typing state" on public.conversation_typing for select to authenticated using (
  exists(select 1 from public.conversation_members cm where cm.conversation_id=conversation_id and cm.user_id=auth.uid())
);
create policy "users manage own typing state" on public.conversation_typing for insert to authenticated with check (user_id=auth.uid());
create policy "users update own typing state" on public.conversation_typing for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "users clear own typing state" on public.conversation_typing for delete to authenticated using (user_id=auth.uid());

-- Supabase Realtime publication. The guarded block keeps local/dev reruns safe.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;
