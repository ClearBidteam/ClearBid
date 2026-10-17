import Link from "next/link";
import { notFound } from "next/navigation";

import { submitSellerReview } from "@/app/actions/seller-profile";
import { createClient } from "@/utils/supabase/server";

function sellerTier(completedSales: number, averageRating: number) {
  if (completedSales >= 20 && averageRating >= 4.8) return "Top seller";
  if (completedSales >= 5 && averageRating >= 4.5) return "Trusted seller";
  return "New seller";
}

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [{ data: authData }, { data: profile }, { data: auctions }, { data: reviews }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("seller_profiles").select("display_name, bio, county, town, avatar_url, contact_email, contact_phone").eq("user_id", id).maybeSingle(),
    supabase.from("auctions").select("id, title, short_description, location, county, status, image_url, starting_price, ends_at, completed_at").eq("seller_id", id).order("created_at", { ascending: false }),
    supabase.from("seller_reviews").select("id, auction_id, rating, review, created_at").eq("seller_id", id).order("created_at", { ascending: false }),
  ]);

  if (!profile && !auctions?.length && authData.user?.id !== id) notFound();

  const user = authData.user;
  const name = profile?.display_name || (user?.id === id ? String(user.user_metadata?.full_name ?? user.email ?? "ClearBid seller") : "ClearBid seller");
  const completedSales = auctions?.filter((auction) => auction.completed_at).length ?? 0;
  const reviewCount = reviews?.length ?? 0;
  const averageRating = reviewCount ? reviews!.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
  const myWinningAuctionIds = new Set<string>();
  if (user) {
    const [{ data: myBids }, { data: summaries }] = await Promise.all([
      supabase.from("bids").select("auction_id, amount").eq("bidder_id", user.id),
      supabase.rpc("get_auction_bid_summaries"),
    ]);
    const winningAmounts = new Map<string, number>(((summaries ?? []) as { auction_id: string; highest_bid: number }[]).map((summary) => [summary.auction_id, Number(summary.highest_bid)]));
    for (const bid of myBids ?? []) {
      if (Number(bid.amount) === winningAmounts.get(bid.auction_id)) myWinningAuctionIds.add(bid.auction_id);
    }
  }
  const reviewedAuctionIds = new Set((reviews ?? []).map((review) => review.auction_id));

  return (
    <main className="min-h-screen px-4 py-10 text-[#182522] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-[#1d7a45] hover:underline">Browse auctions</Link>
        {query?.error ? <p role="alert" className="mt-5 rounded-md bg-[#fff1f1] px-4 py-3 text-sm text-[#a12525]">{query.error}</p> : null}
        {query?.success ? <p role="status" className="mt-5 rounded-md bg-[#edf9ef] px-4 py-3 text-sm text-[#1d6b3f]">{query.success}</p> : null}
        <section className="mt-5 grid gap-6 border-y border-[#d9e6d8] py-7 sm:grid-cols-[160px_1fr]">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="Seller profile" className="size-36 rounded-full object-cover" /> : <div aria-hidden="true" className="grid size-36 place-items-center rounded-full bg-[#dcebdc] text-4xl font-bold text-[#1d7a45]">{name[0]?.toUpperCase()}</div>}
          <div>
            <p className="text-xs font-bold uppercase text-[#267344]">{sellerTier(completedSales, averageRating)}</p>
            <h1 className="mt-2 text-3xl font-bold text-[#173b2b]">{name}</h1>
            <p className="mt-2 text-sm text-[#58665d]">{[profile?.town, profile?.county].filter(Boolean).join(", ") || "Ireland"}</p>
            <p className="mt-4 max-w-2xl whitespace-pre-wrap text-[#35453b]">{profile?.bio || "This seller has not added a profile description yet."}</p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#29452f]">
              <span>{completedSales} completed sales</span>
              <span>{reviewCount ? `${averageRating.toFixed(1)} / 5 from ${reviewCount} reviews` : "No ratings yet"}</span>
              {profile?.contact_email ? <a href={`mailto:${profile.contact_email}`} className="text-[#1d7a45] hover:underline">Email seller</a> : null}
              {profile?.contact_phone ? <a href={`tel:${profile.contact_phone}`} className="text-[#1d7a45] hover:underline">{profile.contact_phone}</a> : null}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between border-b border-[#d9e6d8] pb-3">
            <h2 className="text-2xl font-bold text-[#173b2b]">Auctions</h2>
            <span className="text-sm text-[#58665d]">{auctions?.length ?? 0} listings</span>
          </div>
          <div className="divide-y divide-[#d9e6d8]">
            {(auctions ?? []).map((auction) => (
              <article key={auction.id} className="grid gap-4 py-5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <img src={auction.image_url} alt="" className="aspect-[4/3] w-full rounded-md object-cover sm:w-[120px]" />
                <div>
                  <p className="text-xs font-bold uppercase text-[#64826d]">{auction.status}{auction.completed_at ? " · completed" : ""}</p>
                  <h3 className="mt-1 text-lg font-bold text-[#173b2b]"><Link href={`/auctions/${auction.id}`} className="hover:underline">{auction.title}</Link></h3>
                  <p className="mt-1 text-sm text-[#58665d]">{auction.short_description} · {auction.location}, {auction.county}</p>
                </div>
                {auction.completed_at && user && myWinningAuctionIds.has(auction.id) && !reviewedAuctionIds.has(auction.id) ? (
                  <form action={submitSellerReview} className="grid gap-2 sm:w-52">
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <input type="hidden" name="sellerId" value={id} />
                    <label className="grid gap-1 text-sm font-semibold">Your rating
                      <select name="rating" required className="min-h-10 rounded-md border border-[#c5d7c8] bg-white px-2">
                        <option value="">Choose</option>
                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                      </select>
                    </label>
                    <textarea name="review" maxLength={1000} placeholder="Share how the sale went" className="min-h-16 rounded-md border border-[#c5d7c8] bg-white p-2 text-sm" />
                    <button type="submit" className="min-h-10 rounded-md bg-[#1d7a45] px-3 text-sm font-bold text-white">Leave review</button>
                  </form>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-[#d9e6d8] pt-6">
          <h2 className="text-2xl font-bold text-[#173b2b]">Buyer reviews</h2>
          {reviewCount ? <div className="divide-y divide-[#d9e6d8]">{reviews!.map((review) => <article key={review.id} className="py-4"><p className="font-bold text-[#1d7a45]">{review.rating} / 5</p><p className="mt-1 whitespace-pre-wrap text-[#35453b]">{review.review || "No written comments."}</p></article>)}</div> : <p className="mt-3 text-sm text-[#58665d]">Reviews appear after completed collections.</p>}
        </section>
      </div>
    </main>
  );
}