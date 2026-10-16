import Link from "next/link";
import { notFound } from "next/navigation";

import BidForm from "@/app/auctions/[id]/bid-form";
import { getHighestBid, getMinimumBid } from "@/lib/bid-display";
import { createClient } from "@/utils/supabase/server";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

type AuctionBidSummary = {
  auction_id: string;
  highest_bid: number | null;
  bid_count: number;
};

export default async function AuctionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [{ data: auction }, { data: summaries }, { data: authData }] = await Promise.all([
    supabase
      .from("auctions")
      .select("id, seller_id, title, description, short_description, item_condition, category, county, location, image_url, starting_price, starts_at, ends_at, status")
      .eq("id", id)
      .maybeSingle(),
    supabase.rpc("get_auction_bid_summaries"),
    supabase.auth.getUser(),
  ]);

  if (!auction) {
    notFound();
  }

  const summary = ((summaries ?? []) as AuctionBidSummary[]).find((item) => item.auction_id === auction.id);
  const highestBid = getHighestBid(summary ?? null);
  const bidCount = Number(summary?.bid_count ?? 0);
  const user = authData.user;
  const isOpen = auction.status === "active" && new Date(auction.starts_at) <= new Date() && new Date(auction.ends_at) > new Date();
  const isSeller = user?.id === auction.seller_id;
  const minimumBid = getMinimumBid({
    starting_price: auction.starting_price,
    highest_bid: highestBid,
  }) ?? Number(auction.starting_price);

  return (
    <main className="min-h-screen bg-[#f2f5f1] px-4 py-8 text-[#182522] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#245d3d] hover:underline">
          <span aria-hidden="true">←</span> Browse auctions
        </Link>

        {query?.error ? (
          <p role="alert" className="mt-5 rounded-lg border border-[#efc0bd] bg-[#fff3f1] px-4 py-3 text-sm text-[#8b2924]">
            {query.error}
          </p>
        ) : null}
        {query?.success ? (
          <p role="status" className="mt-5 rounded-lg border border-[#c7e6d0] bg-[#eefaf1] px-4 py-3 text-sm text-[#1f5d39]">
            {query.success}
          </p>
        ) : null}

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <section>
            <div className="overflow-hidden rounded-lg bg-[#dce4dc]">
              <img src={auction.image_url} alt={auction.title} className="aspect-[4/3] max-h-[620px] w-full object-cover" />
            </div>
            <div className="mt-7">
              <p className="text-xs font-bold uppercase text-[#267344]">{auction.category} · {auction.item_condition?.replaceAll("_", " ") ?? "condition not specified"}</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight text-[#173b2b] sm:text-4xl">{auction.title}</h1>
              <p className="mt-3 text-[#58665d]">{auction.location}, Co. {auction.county}</p>
              <p className="mt-6 whitespace-pre-wrap leading-7 text-[#35453b]">{auction.description}</p>
            </div>
          </section>

          <aside className="self-start border-t-4 border-[#267344] bg-white p-5 shadow-[0_12px_32px_rgba(23,59,43,0.08)] sm:p-7">
            <p className="text-sm font-semibold text-[#58665d]">{highestBid === null ? "Starting price" : "Current highest bid"}</p>
            <p className="mt-1 text-4xl font-bold text-[#173b2b]">{formatCurrency(highestBid ?? Number(auction.starting_price))}</p>
            <p className="mt-2 text-sm text-[#58665d]">{bidCount} {bidCount === 1 ? "bid" : "bids"}</p>

            <dl className="mt-6 grid gap-4 border-y border-[#e4eae4] py-5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-[#58665d]">Auction ends</dt><dd className="text-right font-semibold">{formatDate(auction.ends_at)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-[#58665d]">Collection area</dt><dd className="text-right font-semibold">{auction.location}, {auction.county}</dd></div>
            </dl>

            {!isOpen ? (
              <p className="mt-5 rounded-md bg-[#f2f5f1] px-4 py-3 text-sm font-semibold text-[#58665d]">This auction is not open for bidding.</p>
            ) : isSeller ? (
              <p className="mt-5 rounded-md bg-[#f2f5f1] px-4 py-3 text-sm text-[#58665d]">You are the seller and cannot bid on this auction.</p>
            ) : user ? (
              <BidForm auctionId={auction.id} minimumBid={minimumBid} />
            ) : (
              <Link href={`/login?error=Please+log+in+to+place+a+bid.`} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#1d7a45] px-5 font-bold text-white hover:opacity-90">
                Log in to bid
              </Link>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}