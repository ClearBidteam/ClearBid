import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

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

  return (
    <main className="grid min-h-screen place-items-center px-3 py-8 sm:px-5">
      <div className="flex w-full max-w-[540px] flex-col gap-3 rounded-[18px] border border-[#d9e6d8] bg-white/90 p-[22px_18px] shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-8">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#267344]">Your account</p>
        <h1 className="m-0 text-3xl leading-[1.08] text-[#173b2b] sm:text-[2.6rem]">Welcome, {user.email ?? "cleared bidder"}</h1>
        <p className="my-3 text-[#58665d] [line-height:1.6]">You are signed in and ready to manage your ClearBid activity.</p>

        {successMessage ? (
          <p className="rounded-[10px] border border-[#c7e6d0] bg-[#eefaf1] px-3.5 py-3 text-sm text-[#1f5d39]">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/listings/new"
            className="inline-flex min-h-12 w-full min-w-[130px] cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#1d7a45] px-5 font-bold text-white transition-opacity duration-200 hover:opacity-[0.92] sm:w-auto"
          >
            List an auction
          </Link>

          <form action={signOut} className="w-full sm:w-auto">
            <button
              type="submit"
              className="inline-flex min-h-12 w-full min-w-[130px] cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#edf5ee] px-5 font-bold text-[#173b2b] transition-opacity duration-200 hover:opacity-[0.92] sm:w-auto"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
