create type public.wallet_transaction_type as enum ('peer_transfer','community_income','withdrawal','refund','adjustment');
create type public.wallet_transaction_status as enum ('pending','completed','failed','reversed');

create table public.wallet_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  currency text not null default 'USD',
  available_balance numeric(14,2) not null default 0 check (available_balance >= 0),
  pending_balance numeric(14,2) not null default 0 check (pending_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  recipient_id uuid references public.profiles(id) on delete set null,
  transaction_type public.wallet_transaction_type not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null default 'USD',
  status public.wallet_transaction_status not null default 'pending',
  memo text check (char_length(memo) <= 280),
  provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index wallet_transactions_sender_idx on public.wallet_transactions(sender_id, created_at desc);
create index wallet_transactions_recipient_idx on public.wallet_transactions(recipient_id, created_at desc);

alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "users read own wallet" on public.wallet_accounts for select to authenticated using (auth.uid() = user_id);
create policy "users read own transactions" on public.wallet_transactions for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);

create trigger wallet_accounts_set_updated_at before update on public.wallet_accounts for each row execute function public.set_updated_at();

-- Balance mutation is intentionally not exposed through client RLS.
-- Peer transfers, deposits, withdrawals and payment-provider confirmations must be
-- executed by trusted server-side functions after identity, balance and provider checks.
