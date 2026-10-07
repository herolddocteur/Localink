alter table public.wallet_transactions add column if not exists idempotency_key text;
create unique index if not exists wallet_transactions_sender_idempotency_idx on public.wallet_transactions(sender_id, idempotency_key) where idempotency_key is not null;

create table if not exists public.wallet_daily_limits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_send_limit numeric(14,2) not null default 1000 check (daily_send_limit > 0),
  single_transfer_limit numeric(14,2) not null default 500 check (single_transfer_limit > 0),
  updated_at timestamptz not null default now()
);

alter table public.wallet_daily_limits enable row level security;
create policy "users read own wallet limits" on public.wallet_daily_limits for select to authenticated using (auth.uid() = user_id);

create or replace function public.execute_wallet_transfer(
  p_recipient_id uuid,
  p_amount numeric,
  p_memo text default null,
  p_idempotency_key text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_tx uuid;
  v_balance numeric(14,2);
  v_daily_total numeric(14,2);
  v_daily_limit numeric(14,2) := 1000;
  v_single_limit numeric(14,2) := 500;
begin
  if v_sender is null then raise exception 'Authentication required'; end if;
  if p_recipient_id is null or p_recipient_id = v_sender then raise exception 'Invalid recipient'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Invalid amount'; end if;
  if p_amount <> round(p_amount, 2) then raise exception 'Amount supports at most two decimals'; end if;
  if char_length(coalesce(p_memo,'')) > 280 then raise exception 'Memo too long'; end if;

  select daily_send_limit, single_transfer_limit into v_daily_limit, v_single_limit
  from public.wallet_daily_limits where user_id = v_sender;
  v_daily_limit := coalesce(v_daily_limit, 1000);
  v_single_limit := coalesce(v_single_limit, 500);
  if p_amount > v_single_limit then raise exception 'Transfer exceeds single-transfer limit'; end if;

  if p_idempotency_key is not null then
    select id into v_tx from public.wallet_transactions where sender_id=v_sender and idempotency_key=p_idempotency_key;
    if v_tx is not null then return v_tx; end if;
  end if;

  insert into public.wallet_accounts(user_id) values (v_sender) on conflict (user_id) do nothing;
  insert into public.wallet_accounts(user_id) values (p_recipient_id) on conflict (user_id) do nothing;

  perform 1 from public.wallet_accounts where user_id in (v_sender,p_recipient_id) order by user_id for update;
  select available_balance into v_balance from public.wallet_accounts where user_id=v_sender;
  if v_balance < p_amount then raise exception 'Insufficient balance'; end if;

  select coalesce(sum(amount),0) into v_daily_total from public.wallet_transactions
  where sender_id=v_sender and transaction_type='peer_transfer' and status='completed' and created_at >= date_trunc('day', now());
  if v_daily_total + p_amount > v_daily_limit then raise exception 'Daily transfer limit reached'; end if;

  update public.wallet_accounts set available_balance=available_balance-p_amount where user_id=v_sender;
  update public.wallet_accounts set available_balance=available_balance+p_amount where user_id=p_recipient_id;

  insert into public.wallet_transactions(sender_id,recipient_id,transaction_type,amount,currency,status,memo,idempotency_key,completed_at)
  values(v_sender,p_recipient_id,'peer_transfer',p_amount,'USD','completed',nullif(trim(p_memo),''),p_idempotency_key,now()) returning id into v_tx;
  return v_tx;
end;
$$;

revoke all on function public.execute_wallet_transfer(uuid,numeric,text,text) from public;
grant execute on function public.execute_wallet_transfer(uuid,numeric,text,text) to authenticated;
