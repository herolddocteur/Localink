alter type public.notification_type add value if not exists 'community';
alter type public.notification_type add value if not exists 'money';
alter type public.notification_type add value if not exists 'event';

alter table public.notifications
  add column if not exists title text,
  add column if not exists body text,
  add column if not exists conversation_id uuid references public.conversations(id) on delete cascade,
  add column if not exists community_id uuid references public.communities(id) on delete cascade,
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists wallet_transaction_id uuid references public.wallet_transactions(id) on delete cascade;

create or replace function public.notify_follow() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.notifications(user_id,actor_id,type,title,body) values(new.following_id,new.follower_id,'follow','New follower','Someone started following you.');
 return new;
end;$$;

drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows for each row execute function public.notify_follow();

create or replace function public.notify_like() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_id uuid;
begin
 select author_id into owner_id from public.posts where id=new.post_id;
 if owner_id is distinct from new.user_id then insert into public.notifications(user_id,actor_id,type,post_id,title,body) values(owner_id,new.user_id,'like',new.post_id,'New like','Someone liked your post.'); end if;
 return new;
end;$$;

drop trigger if exists likes_notify on public.post_likes;
create trigger likes_notify after insert on public.post_likes for each row execute function public.notify_like();

create or replace function public.notify_comment() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_id uuid;
begin
 select author_id into owner_id from public.posts where id=new.post_id;
 if owner_id is distinct from new.author_id then insert into public.notifications(user_id,actor_id,type,post_id,comment_id,title,body) values(owner_id,new.author_id,'comment',new.post_id,new.id,'New comment','Someone commented on your post.'); end if;
 return new;
end;$$;

drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments for each row execute function public.notify_comment();
