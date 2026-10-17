"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateListingInput } from "@/lib/listings-validation";
import { IRISH_COUNTIES } from "@/lib/counties";
import { createClient } from "@/utils/supabase/server";

export async function createListing(formData: FormData) {
  const imageFiles = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (imageFiles.length === 0) {
    redirect("/listings/new?error=Please+upload+at+least+one+listing+photo.");
  }

  const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (imageFiles.length > 5) {
    redirect("/listings/new?error=Choose+no+more+than+5+photos.");
  }
  if (imageFiles.some((file) => !allowedImageTypes.has(file.type) || file.size > 5 * 1024 * 1024)) {
    redirect("/listings/new?error=Each+photo+must+be+JPEG,+PNG,+WebP,+or+GIF+under+5+MB.");
  }

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
    imageUrl: "pending-upload",
  };

  const { values, errors } = validateListingInput(payload);

  if (!IRISH_COUNTIES.some((county) => county.toLowerCase() === values.county.toLowerCase())) {
    errors.push("Select one of the 26 counties in the Republic of Ireland.");
  }

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

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const imageUrls: string[] = [];
  const uploadedPaths: string[] = [];
  for (const imageFile of imageFiles) {
    const uploadPath = `${user.id}/${crypto.randomUUID()}.${extensionByType[imageFile.type]}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(uploadPath, imageFile, { contentType: imageFile.type });

    if (uploadError) {
      if (uploadedPaths.length) {
        await supabase.storage.from("listing-images").remove(uploadedPaths);
      }
      const message = uploadError.message.includes("not found")
        ? "Create the 'listing-images' bucket in Supabase Storage before uploading photos."
        : uploadError.message;
      redirect(`/listings/new?error=${encodeURIComponent(message)}`);
    }

    uploadedPaths.push(uploadData.path);
    const { data: publicUrlData } = supabase.storage.from("listing-images").getPublicUrl(uploadData.path);
    imageUrls.push(publicUrlData.publicUrl);
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
    image_url: imageUrls[0],
    image_urls: imageUrls,
    starting_price: values.startPrice,
    reserve_price: values.reservePrice,
    starts_at: new Date().toISOString(),
    ends_at: values.endsAt,
    status: "active",
  });

  if (error) {
    await supabase.storage.from("listing-images").remove(uploadedPaths);
    redirect(`/listings/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account", "layout");
  redirect("/account?success=Auction+created+successfully.");
}
