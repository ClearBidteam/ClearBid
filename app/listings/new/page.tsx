import Link from "next/link";
import { redirect } from "next/navigation";

import { createListing } from "@/app/actions/listings";
import { createClient } from "@/utils/supabase/server";

function formatMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  return now.toISOString().slice(0, 16);
}

export default async function NewListingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const errorMessage = params.error ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Please+log+in+to+list+an+auction.");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[22px] border border-[#d9e6d8] bg-white/90 p-5 shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#267344]">Sell with ClearBid</p>
            <h1 className="mt-2 text-3xl font-bold text-[#173b2b] sm:text-4xl">Create a listing</h1>
          </div>
          <Link href="/account" className="rounded-full border border-[#d9e6d8] bg-[#edf5ee] px-4 py-2 text-sm font-semibold text-[#173b2b] transition-opacity hover:opacity-90">
            Back to account
          </Link>
        </div>

        {errorMessage ? (
          <p className="mb-5 rounded-[10px] border border-[#f5b4b4] bg-[#fff1f1] px-3.5 py-3 text-sm text-[#a12525]">
            {errorMessage}
          </p>
        ) : null}

        <form action={createListing} className="grid gap-5" encType="multipart/form-data">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Listing title</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="title"
                type="text"
                placeholder="Garage full of tools"
                required
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Category</span>
              <select
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="category"
                defaultValue=""
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="house">House clearance</option>
                <option value="garage">Garage &amp; tools</option>
                <option value="furniture">Furniture</option>
                <option value="antiques">Antiques</option>
                <option value="garden">Garden &amp; shed</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
            <span>Short item summary</span>
            <textarea
              className="min-h-[80px] w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 py-3 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
              name="shortDescription"
              placeholder="Cordless drill set, ladder and tools."
              maxLength={180}
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Item condition</span>
              <select
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="itemCondition"
                defaultValue=""
                required
              >
                <option value="" disabled>Select condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="needs_work">Needs work</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Listing photo</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 py-2 font-[inherit] file:mr-3 file:rounded-full file:border-0 file:bg-[#edf5ee] file:px-3 file:py-1 file:font-semibold file:text-[#173b2b] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="image"
                type="file"
                accept="image/*"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
            <span>Description</span>
            <textarea
              className="min-h-[120px] w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 py-3 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
              name="description"
              placeholder="Describe the items and any collection notes."
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>County</span>
              <select
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="county"
                defaultValue=""
                required
              >
                <option value="" disabled>Select county</option>
                <option value="galway">Galway</option>
                <option value="cork">Cork</option>
                <option value="louth">Louth</option>
                <option value="kildare">Kildare</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Location</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="location"
                type="text"
                placeholder="Cork City"
                required
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Start price</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="startPrice"
                type="number"
                min="1"
                step="0.01"
                placeholder="150"
                required
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Reserve price</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="reservePrice"
                type="number"
                min="1"
                step="0.01"
                placeholder="450"
                required
              />
            </label>

            <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
              <span>Ends at</span>
              <input
                className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
                name="endsAt"
                type="datetime-local"
                min={formatMinDateTime()}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#1d7a45] px-5 font-bold text-white transition-opacity duration-200 hover:opacity-[0.92]"
          >
            Publish listing
          </button>
        </form>
      </div>
    </main>
  );
}
