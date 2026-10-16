"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseBidAmount } from "@/lib/bid-validation";
import { createClient } from "@/utils/supabase/server";

export async function placeBid(formData: FormData) {
  const auctionId = String(formData.get("auctionId") ?? "");
  const invalidAuctionId = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(auctionId);

  if (invalidAuctionId) {
    redirect("/?error=That+auction+could+not+be+found.");
  }

  const { amount, error: amountError } = parseBidAmount(formData.get("amount"));
  if (amountError || amount === null) {
    redirect(`/auctions/${auctionId}?error=${encodeURIComponent(amountError)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=Please+log+in+to+place+a+bid.`);
  }

  const { error } = await supabase.rpc("place_auction_bid", {
    p_auction_id: auctionId,
    p_amount: amount,
  });

  if (error) {
    const message = error.message.includes("own auction")
      ? "You cannot bid on your own auction."
      : error.message.includes("higher than the current bid")
        ? "Your bid must be at least the starting price and higher than the current bid."
        : error.message.includes("not open for bidding")
          ? "This auction is no longer open for bidding."
          : "We could not place that bid. Refresh the auction and try again.";
    redirect(`/auctions/${auctionId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/account");
  redirect(`/auctions/${auctionId}?success=Your+bid+was+placed.`);
}