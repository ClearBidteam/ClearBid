create extension if not exists pgcrypto;

create table if not exists public.auctions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  short_description text not null,
  item_condition text not null check (item_condition in ('excellent', 'good', 'fair', 'needs_work')),
  category text not null,
  county text not null,
  location text not null,
  image_url text not null,
  starting_price numeric(12, 2) not null check (starting_price > 0),
  reserve_price numeric(12, 2) not null check (reserve_price > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.auctions enable row level security;
alter table public.bids enable row level security;

create policy "Anyone can view auctions"
on public.auctions for select
using (true);

create policy "Sellers can create auctions"
on public.auctions for insert
with check (auth.uid() = seller_id);

create policy "Sellers can update their auctions"
on public.auctions for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

create policy "Anyone can view bids"
on public.bids for select
using (true);

create policy "Buyers can create bids"
on public.bids for insert
with check (auth.uid() = bidder_id);

create policy "Users can see their own bids"
on public.bids for select
using (auth.uid() = bidder_id);

create index if not exists auctions_seller_id_idx on public.auctions (seller_id);
create index if not exists auctions_ends_at_idx on public.auctions (ends_at);
create index if not exists bids_auction_id_idx on public.bids (auction_id);
create index if not exists bids_bidder_id_idx on public.bids (bidder_id);
