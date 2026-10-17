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
  image_urls text[] not null default '{}',
  starting_price numeric(12, 2) not null check (starting_price > 0),
  reserve_price numeric(12, 2) not null check (reserve_price > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('draft', 'active', 'closed')),
  view_count bigint not null default 0 check (view_count >= 0),
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
  add column if not exists image_urls text[] not null default '{}',
  add column if not exists seller_collection_confirmed_at timestamptz,
  add column if not exists buyer_collection_confirmed_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists starting_price numeric(12, 2),
  add column if not exists reserve_price numeric(12, 2),
  add column if not exists starts_at timestamptz default now(),
  add column if not exists ends_at timestamptz,
  add column if not exists status text default 'active',
  add column if not exists view_count bigint not null default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.seller_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  county text not null default '',
  town text not null default '',
  avatar_url text,
  contact_email text not null default '',
  contact_phone text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.seller_profiles add column if not exists display_name text not null default '';

alter table public.seller_profiles enable row level security;
revoke all on public.seller_profiles from anon, authenticated;
grant select on public.seller_profiles to anon, authenticated;
grant insert, update on public.seller_profiles to authenticated;

drop policy if exists "Seller profiles are public" on public.seller_profiles;
drop policy if exists "Sellers manage their own profile" on public.seller_profiles;
create policy "Seller profiles are public"
on public.seller_profiles for select to anon, authenticated
using (true);
create policy "Sellers manage their own profile"
on public.seller_profiles for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null unique references public.auctions (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  review text not null default '',
  created_at timestamptz not null default now()
);

alter table public.seller_reviews enable row level security;
revoke all on public.seller_reviews from anon, authenticated;
grant select on public.seller_reviews to anon, authenticated;
grant insert on public.seller_reviews to authenticated;

drop policy if exists "Seller reviews are public" on public.seller_reviews;
drop policy if exists "Completed buyers can review sellers" on public.seller_reviews;
create policy "Seller reviews are public"
on public.seller_reviews for select to anon, authenticated
using (true);

create or replace function public.confirm_auction_collection(p_auction_id uuid)
returns table (is_participant boolean, seller_confirmed boolean, buyer_confirmed boolean, completed_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  auction_record public.auctions%rowtype;
  winning_bidder uuid;
begin
  if current_user_id is null then
    raise exception 'You must be signed in.';
  end if;

  select * into auction_record
  from public.auctions where id = p_auction_id
  for update;

  if not found or auction_record.ends_at > pg_catalog.now() then
    raise exception 'Collection can only be confirmed after an auction ends.';
  end if;

  select b.bidder_id into winning_bidder
  from public.bids b
  where b.auction_id = p_auction_id
  order by b.amount desc, b.created_at asc
  limit 1;

  if current_user_id = auction_record.seller_id then
    update public.auctions
    set seller_collection_confirmed_at = coalesce(seller_collection_confirmed_at, pg_catalog.now())
    where id = p_auction_id;
  elsif current_user_id = winning_bidder then
    update public.auctions
    set buyer_collection_confirmed_at = coalesce(buyer_collection_confirmed_at, pg_catalog.now())
    where id = p_auction_id;
  else
    return query select false, auction_record.seller_collection_confirmed_at is not null,
      auction_record.buyer_collection_confirmed_at is not null, auction_record.completed_at;
    return;
  end if;

  select * into auction_record from public.auctions where id = p_auction_id;

  if auction_record.seller_collection_confirmed_at is not null
    and auction_record.buyer_collection_confirmed_at is not null
  then
    update public.auctions
    set completed_at = coalesce(completed_at, pg_catalog.now())
    where id = p_auction_id
    returning * into auction_record;
  end if;

  return query select true, auction_record.seller_collection_confirmed_at is not null,
    auction_record.buyer_collection_confirmed_at is not null, auction_record.completed_at;
end;
$$;

revoke all on function public.confirm_auction_collection(uuid) from public, anon;
grant execute on function public.confirm_auction_collection(uuid) to authenticated;

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

create or replace function public.record_auction_view(p_auction_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.auctions
  set view_count = view_count + 1
  where id = p_auction_id
    and status = 'active';
$$;

revoke all on function public.record_auction_view(uuid) from public;
grant execute on function public.record_auction_view(uuid) to anon, authenticated;

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

create policy "Completed buyers can review sellers"
on public.seller_reviews for insert to authenticated
with check (
  buyer_id = (select auth.uid())
  and exists (
    select 1
    from public.auctions a
    join public.bids b on b.auction_id = a.id and b.bidder_id = (select auth.uid())
    where a.id = seller_reviews.auction_id
      and a.seller_id = seller_reviews.seller_id
      and a.completed_at is not null
      and b.amount = (
        select s.highest_bid
        from public.get_auction_bid_summaries() s
        where s.auction_id = a.id
      )
  )
);

create or replace function public.get_auction_collection_status(p_auction_id uuid)
returns table (is_participant boolean, seller_confirmed boolean, buyer_confirmed boolean, completed_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (auth.uid() = a.seller_id or auth.uid() = winning.bidder_id),
    a.seller_collection_confirmed_at is not null,
    a.buyer_collection_confirmed_at is not null,
    a.completed_at
  from public.auctions a
  left join lateral (
    select b.bidder_id
    from public.bids b
    where b.auction_id = a.id
    order by b.amount desc, b.created_at asc
    limit 1
  ) winning on true
  where a.id = p_auction_id;
$$;

revoke all on function public.get_auction_collection_status(uuid) from public;
grant execute on function public.get_auction_collection_status(uuid) to anon, authenticated;

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

  if p_amount < greatest(
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
