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

alter table public.auctions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists seller_id uuid references auth.users (id) on delete cascade,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists short_description text,
  add column if not exists item_condition text,
  add column if not exists category text,
  add column if not exists county text,
  add column if not exists location text,
  add column if not exists image_url text,
  add column if not exists starting_price numeric(12, 2),
  add column if not exists reserve_price numeric(12, 2),
  add column if not exists starts_at timestamptz default now(),
  add column if not exists ends_at timestamptz,
  add column if not exists status text default 'active',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions (id) on delete cascade,
  bidder_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.bids
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists auction_id uuid references public.auctions (id) on delete cascade,
  add column if not exists bidder_id uuid references auth.users (id) on delete cascade,
  add column if not exists amount numeric(12, 2),
  add column if not exists created_at timestamptz default now();

alter table public.auctions enable row level security;
alter table public.bids enable row level security;

grant select on public.auctions to anon, authenticated;
grant insert, update on public.auctions to authenticated;
grant select on public.bids to authenticated;

drop policy if exists "Anyone can view auctions" on public.auctions;
drop policy if exists "Sellers can create auctions" on public.auctions;
drop policy if exists "Sellers can update their auctions" on public.auctions;
drop policy if exists "Anyone can view bids" on public.bids;
drop policy if exists "Buyers can create bids" on public.bids;
drop policy if exists "Users can see their own bids" on public.bids;
drop policy if exists "Sellers can view bids on their auctions" on public.bids;

create policy "Anyone can view auctions"
on public.auctions for select to anon, authenticated
using (true);

create policy "Sellers can create auctions"
on public.auctions for insert to authenticated
with check ((select auth.uid()) = seller_id);

create policy "Sellers can update their auctions"
on public.auctions for update to authenticated
using ((select auth.uid()) = seller_id)
with check ((select auth.uid()) = seller_id);

create policy "Users can see their own bids"
on public.bids for select to authenticated
using ((select auth.uid()) = bidder_id);

create policy "Sellers can view bids on their auctions"
on public.bids for select to authenticated
using (
  exists (
    select 1
    from public.auctions
    where auctions.id = bids.auction_id
      and auctions.seller_id = (select auth.uid())
  )
);

revoke insert on public.bids from anon, authenticated;

create or replace function public.get_auction_bid_summaries()
returns table (auction_id uuid, highest_bid numeric, bid_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select bids.auction_id, max(bids.amount), count(*)
  from public.bids
  group by bids.auction_id;
$$;

revoke all on function public.get_auction_bid_summaries() from public;
grant execute on function public.get_auction_bid_summaries() to anon, authenticated;

create or replace function public.place_auction_bid(p_auction_id uuid, p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$

declare
  current_user_id uuid := auth.uid();
  auction_record public.auctions%rowtype;
  current_highest numeric;
  new_bid_id uuid;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to bid.';
  end if;

  if p_amount is null
    or p_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_amount <= 0
    or p_amount <> round(p_amount, 2)
  then
    raise exception 'Enter a valid bid with at most two decimal places.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_auction_id::text, 0));

  select * into auction_record
  from public.auctions
  where id = p_auction_id;

  if not found then
    raise exception 'Auction not found.';
  end if;

  if auction_record.status <> 'active'
    or auction_record.starts_at > pg_catalog.now()
    or auction_record.ends_at <= pg_catalog.now()
  then
    raise exception 'This auction is not open for bidding.';
  end if;

  if auction_record.seller_id = current_user_id then
    raise exception 'You cannot bid on your own auction.';
  end if;

  select max(amount) into current_highest
  from public.bids
  where auction_id = p_auction_id;

  if p_amount < pg_catalog.greatest(
    auction_record.starting_price,
    coalesce(current_highest + 0.01, auction_record.starting_price)
  ) then
    raise exception 'Your bid must be at least the starting price and higher than the current bid.';
  end if;

  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, current_user_id, p_amount)
  returning id into new_bid_id;

  return new_bid_id;
end;
$$;

revoke all on function public.place_auction_bid(uuid, numeric) from public, anon;
grant execute on function public.place_auction_bid(uuid, numeric) to authenticated;
create index if not exists auctions_seller_id_idx on public.auctions (seller_id);
create index if not exists auctions_ends_at_idx on public.auctions (ends_at);
create index if not exists bids_auction_id_idx on public.bids (auction_id);
create index if not exists bids_bidder_id_idx on public.bids (bidder_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own listing images" on storage.objects;
create policy "Users can upload their own listing images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
