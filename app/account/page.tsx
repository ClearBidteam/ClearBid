import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="auth-shell">
      <div className="auth-card account-card">
        <p className="eyebrow">Your account</p>
        <h1>Welcome, {user.email ?? "cleared bidder"}</h1>
        <p className="intro">You are signed in and ready to manage your ClearBid activity.</p>

        <div className="account-actions">
          <a href="/" className="secondary-button">
            Back to home
          </a>

          <form action={signOut}>
            <button type="submit" className="danger-button">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
