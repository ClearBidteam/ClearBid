import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { getAuctionDisplay } from "@/lib/bid-display";
import { createClient } from "@/utils/supabase/server";

function formatCurrency(value: number | null | undefined) {
  if (!value && value !== 0) {
    return "—";
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ success?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const successMessage = params.success ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "No email on file";
  const firstName = String(user.user_metadata?.first_name ?? "").trim();
  const lastName = String(user.user_metadata?.last_name ?? "").trim();
  const fullName =
    String(user.user_metadata?.full_name ?? "").trim() ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "ClearBid member";

  const [{ data: listingsData, error: listingsError }, { data: bidsData, error: bidsError }] = await Promise.all([
    supabase
      .from("auctions")
      .select("id, title, location, category, status, starts_at, ends_at, starting_price, reserve_price, created_at, short_description, item_condition, image_url")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("bids")
      .select("id, amount, created_at, auction_id, auctions(title, location)")
      .eq("bidder_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const listings = listingsError ? [] : listingsData ?? [];
  const bids = bidsError ? [] : bidsData ?? [];
  const listingIds = listings.map((listing) => listing.id);
  const { data: listingBidsData, error: listingBidsError } = listingIds.length
    ? await supabase.from("bids").select("auction_id, amount").in("auction_id", listingIds)
    : { data: [], error: null };

  const highestBidByAuction = new Map<string, number>();
  for (const bid of listingBidsError ? [] : listingBidsData ?? []) {
    const auctionId = String(bid.auction_id);
    const amount = Number(bid.amount ?? 0);
    const prev = highestBidByAuction.get(auctionId) ?? 0;
    if (amount > prev) {
      highestBidByAuction.set(auctionId, amount);
    }
  }

  const totalEarned = Array.from(highestBidByAuction.values()).reduce((sum, amount) => sum + amount, 0);
  const activeListings = listings.filter((listing) => listing.status === "active").length;

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f3f6f1_0%,#e7efe5_100%)] px-4 py-8 text-[#182522] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#267344]">Your account</p>
            <h1 className="mt-2 text-3xl font-bold text-[#173b2b] sm:text-4xl">Welcome back, {fullName}</h1>
            <p className="mt-2 text-sm text-[#58665d]">Manage your profile, listings, and bidding activity.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#d9e6d8] bg-[#edf5ee] px-5 font-bold text-[#173b2b] transition-opacity hover:opacity-90"
            >
              Browse auctions
            </Link>
            <Link
              href="/listings/new"
              className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#1d7a45] px-5 font-bold text-white transition-opacity hover:opacity-90"
            >
              List an auction
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#d9e6d8] bg-[#edf5ee] px-5 font-bold text-[#173b2b] transition-opacity hover:opacity-90"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {successMessage ? (
          <div className="mb-6 rounded-[12px] border border-[#c7e6d0] bg-[#eefaf1] px-4 py-3 text-sm font-medium text-[#1f5d39]">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[24px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[#173b2b]">Profile</h2>
              <span className="rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#267344]">
                member
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Name</p>
                <p className="mt-2 text-lg font-bold text-[#173b2b]">{fullName}</p>
              </div>

              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Email</p>
                <p className="mt-2 text-lg font-bold text-[#173b2b] break-all">{email}</p>
              </div>

              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Member since</p>
                <p className="mt-2 text-lg font-bold text-[#173b2b]">{formatDate(user.created_at)}</p>
              </div>

              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Total bids</p>
                <p className="mt-2 text-lg font-bold text-[#173b2b]">{bids.length}</p>
              </div>
            </div>
          </section>

          <aside className="rounded-[24px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-6">
            <h2 className="text-2xl font-bold text-[#173b2b]">Overview</h2>

            <div className="mt-5 space-y-4">
              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Active listings</p>
                <p className="mt-2 text-3xl font-bold text-[#173b2b]">{activeListings}</p>
              </div>

              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Total listings</p>
                <p className="mt-2 text-3xl font-bold text-[#173b2b]">{listings.length}</p>
              </div>

              <div className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64826d]">Amount earned</p>
                <p className="mt-2 text-3xl font-bold text-[#173b2b]">{formatCurrency(totalEarned)}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[24px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[#173b2b]">Your listings</h2>
              <Link href="/listings/new" className="text-sm font-semibold text-[#1d7a45] hover:underline">
                New listing
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#c5d7c8] bg-[#f9fbf8] p-6 text-center text-[#58665d]">
                You have not created any listings yet. Start by listing a clearance or collection.
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <article key={listing.id} className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#64826d]">
                          {listing.category}
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-[#173b2b]">
                          <Link href={`/auctions/${listing.id}`} className="hover:underline">
                            {listing.title}
                          </Link>
                        </h3>
                        <p className="mt-2 text-sm text-[#58665d]">{listing.short_description ?? "No summary provided."}</p>
                      </div>
                      <span className="rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#267344]">
                        {listing.status}
                      </span>
                    </div>

                    {listing.image_url ? (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="mt-4 h-48 w-full rounded-[12px] object-cover"
                      />
                    ) : null}

                    <div className="mt-3 grid gap-3 text-sm text-[#58665d] sm:grid-cols-2">
                      <p>📍 {listing.location}</p>
                      <p>💰 Start: {formatCurrency(Number(listing.starting_price ?? 0))}</p>
                      <p>🗓 Ends: {formatDate(listing.ends_at)}</p>
                      <p>🛡 Reserve: {formatCurrency(Number(listing.reserve_price ?? 0))}</p>
                      <p className="sm:col-span-2">🧰 Condition: {listing.item_condition ?? "Not stated"}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-[#173b2b]">Your bids</h2>
              <span className="rounded-full bg-[#edf5ee] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#267344]">
                {bids.length} bids
              </span>
            </div>

            {bids.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-[#c5d7c8] bg-[#f9fbf8] p-6 text-center text-[#58665d]">
                You have not placed any bids yet. Browse live auctions to start bidding.
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => {
                  const auctionDisplay = getAuctionDisplay(bid.auctions);

                  return (
                    <article key={bid.id} className="rounded-[16px] border border-[#edf2ee] bg-[#f9fbf8] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#64826d]">Auction</p>
                            <h3 className="mt-1 text-lg font-bold text-[#173b2b]">
                              <Link href={`/auctions/${bid.auction_id}`} className="hover:underline">
                                {auctionDisplay.title}
                              </Link>
                            </h3>
                        </div>
                        <span className="text-lg font-bold text-[#173b2b]">{formatCurrency(Number(bid.amount ?? 0))}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#58665d]">
                        <span>{auctionDisplay.location}</span>
                        <span>{formatDate(bid.created_at)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
