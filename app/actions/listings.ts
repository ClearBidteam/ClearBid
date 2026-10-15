"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateListingInput } from "@/lib/listings-validation";
import { createClient } from "@/utils/supabase/server";

export async function createListing(formData: FormData) {
  const payload = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    county: String(formData.get("county") ?? ""),
    location: String(formData.get("location") ?? ""),
    startPrice: String(formData.get("startPrice") ?? ""),
    reservePrice: String(formData.get("reservePrice") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
  };

  const { values, errors } = validateListingInput(payload);

  if (errors.length > 0) {
    redirect(`/listings/new?error=${encodeURIComponent(errors.join(" "))}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=Please+log+in+to+list+an+auction.");
  }

  const { error } = await supabase.from("auctions").insert({
    seller_id: user.id,
    title: values.title,
    description: values.description,
    category: values.category,
    county: values.county,
    location: values.location,
    starting_price: values.startPrice,
    reserve_price: values.reservePrice,
    starts_at: new Date().toISOString(),
    ends_at: values.endsAt,
    status: "active",
  });

  if (error) {
    redirect(`/listings/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account", "layout");
  redirect("/account?success=Auction+created+successfully.");
}
