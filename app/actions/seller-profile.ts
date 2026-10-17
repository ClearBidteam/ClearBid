"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { IRISH_COUNTIES } from "@/lib/counties";

export async function updateSellerProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please+log+in+to+edit+your+seller+profile.");

  const bio = String(formData.get("bio") ?? "").trim();
  const county = String(formData.get("county") ?? "");
  const town = String(formData.get("town") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const avatarFile = formData.get("avatar");
  let avatarUrl = String(formData.get("currentAvatarUrl") ?? "").trim() || null;

  if (bio.length > 500 || town.length > 100 || contactPhone.length > 40) {
    redirect("/account?error=Please+shorten+one+or+more+profile+fields.");
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    redirect("/account?error=Enter+a+valid+public+contact+email.");
  }
  if (county && !IRISH_COUNTIES.some((name) => name.toLowerCase() === county.toLowerCase())) {
    redirect("/account?error=Select+one+of+the+26+counties+in+the+Republic+of+Ireland.");
  }
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    if (!extensions[avatarFile.type] || avatarFile.size > 5 * 1024 * 1024) {
      redirect("/account?error=Profile+photo+must+be+JPEG,+PNG,+WebP,+or+GIF+under+5+MB.");
    }
    const path = `${user.id}/avatar-${crypto.randomUUID()}.${extensions[avatarFile.type]}`;
    const { data, error } = await supabase.storage.from("listing-images").upload(path, avatarFile, { contentType: avatarFile.type });
    if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);
    avatarUrl = supabase.storage.from("listing-images").getPublicUrl(data.path).data.publicUrl;
  }

  const { error } = await supabase.from("seller_profiles").upsert({
    user_id: user.id,
    display_name: String(user.user_metadata?.full_name ?? user.email ?? "ClearBid seller"),
    bio,
    county,
    town,
    avatar_url: avatarUrl,
    contact_email: contactEmail,
    contact_phone: contactPhone,
    updated_at: new Date().toISOString(),
  });
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  revalidatePath(`/sellers/${user.id}`);
  redirect("/account?success=Seller+profile+updated.");
}

export async function submitSellerReview(formData: FormData) {
  const auctionId = String(formData.get("auctionId") ?? "");
  const sellerId = String(formData.get("sellerId") ?? "");
  const rating = Number(formData.get("rating"));
  const review = String(formData.get("review") ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || review.length > 1000) {
    redirect(`/sellers/${sellerId}?error=Enter+a+rating+from+1+to+5+and+a+review+under+1000+characters.`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please+log+in+to+leave+a+seller+review.");

  const { error } = await supabase.from("seller_reviews").insert({
    auction_id: auctionId,
    seller_id: sellerId,
    buyer_id: user.id,
    rating,
    review,
  });
  if (error) {
    const message = error.code === "23505"
      ? "You have already reviewed this completed sale."
      : "Reviews are available only to the winning buyer after both sides confirm collection.";
    redirect(`/sellers/${sellerId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/sellers/${sellerId}`);
  redirect(`/sellers/${sellerId}?success=Review+submitted.`);
}

export async function confirmCollection(formData: FormData) {
  const auctionId = String(formData.get("auctionId") ?? "");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=Please+log+in+to+confirm+collection.");

  const { error } = await supabase.rpc("confirm_auction_collection", { p_auction_id: auctionId });
  if (error) redirect(`/auctions/${auctionId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/account");
  redirect(`/auctions/${auctionId}?success=Collection+confirmation+saved.`);
}