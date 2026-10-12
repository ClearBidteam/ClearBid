import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/account");
  }

  return (
    <main className="hero-shell">
      <div className="hero-card">
        <p className="eyebrow">ClearBid</p>
        <h1>Sell the clutter. Let the market decide.</h1>
        <p className="intro">
          Browse household and garage clearance auctions, place bids, and manage your account with a live
          Supabase-backed user flow.
        </p>

        <div className="hero-actions">
          <Link href="/signup" className="primary-button">
            Create account
          </Link>
          <Link href="/login" className="secondary-button">
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}