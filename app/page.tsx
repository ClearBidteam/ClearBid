import HomePage from "./home-page";
import { createClient } from "@/utils/supabase/server";

type AuctionBidSummary = {
  auction_id: string;
  highest_bid: number | null;
  bid_count: number;
};

export default async function Page() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [{ data: auctionData }, { data: bidSummaryData }] = await Promise.all([
    supabase
      .from("auctions")
      .select("id, title, description, short_description, category, county, location, image_url, starting_price, ends_at")
      .eq("status", "active")
      .lte("starts_at", now)
      .gt("ends_at", now)
      .order("ends_at", { ascending: true })
      .limit(50),
    supabase.rpc("get_auction_bid_summaries"),
  ]);

  const bidSummaries = new Map<string, AuctionBidSummary>(
    ((bidSummaryData ?? []) as AuctionBidSummary[]).map((summary) => [summary.auction_id, summary]),
  );
  const auctions = (auctionData ?? []).map((auction) => ({
    ...auction,
    short_description: auction.short_description ?? auction.description,
    highest_bid: bidSummaries.get(auction.id)?.highest_bid ?? null,
    bid_count: bidSummaries.get(auction.id)?.bid_count ?? 0,
  }));

  return <HomePage auctions={auctions} />;
}