"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateListingInput } from "@/lib/listings-validation";
import { createClient } from "@/utils/supabase/server";

export async function createListing(formData: FormData) {
  const imageFile = formData.get("image");
  const payload = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    itemCondition: String(formData.get("itemCondition") ?? ""),
    category: String(formData.get("category") ?? ""),
    county: String(formData.get("county") ?? ""),
    location: String(formData.get("location") ?? ""),
    startPrice: String(formData.get("startPrice") ?? ""),
    reservePrice: String(formData.get("reservePrice") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    imageUrl: "",
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

  let imageUrl = "";

  if (imageFile instanceof File && imageFile.size > 0) {
    const safeFileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const uploadPath = `${user.id}/${safeFileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(uploadPath, imageFile, {
        upsert: true,
        contentType: imageFile.type || "application/octet-stream",
      });

    if (uploadError) {
      const message = uploadError.message.includes("not found")
        ? "Create a public 'listing-images' bucket in Supabase Storage before uploading photos."
        : uploadError.message;
      redirect(`/listings/new?error=${encodeURIComponent(message)}`);
    }

    const { data: publicUrlData } = supabase.storage.from("listing-images").getPublicUrl(uploadData.path);
    imageUrl = publicUrlData.publicUrl;
  }

  if (!imageUrl) {
    redirect("/listings/new?error=Please+upload+a+listing+photo.");
  }

  const { error } = await supabase.from("auctions").insert({
    seller_id: user.id,
    title: values.title,
    description: values.description,
    short_description: values.shortDescription,
    item_condition: values.itemCondition,
    category: values.category,
    county: values.county,
    location: values.location,
    image_url: imageUrl,
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
