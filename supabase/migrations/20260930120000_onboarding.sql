alter table public.profiles
  add column if not exists interests text[] not null default '{}',
  add column if not exists show_city boolean not null default true,
  add column if not exists message_permission text not null default 'friends',
  add column if not exists post_visibility text not null default 'public',
  add column if not exists onboarding_complete boolean not null default false;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
