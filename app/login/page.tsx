import Link from "next/link";

import { signIn } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const errorMessage = params.error ?? "";
  const successMessage = params.success ?? "";

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to ClearBid</h1>

        {errorMessage ? <p className="message error">{errorMessage}</p> : null}
        {successMessage ? <p className="message success">{successMessage}</p> : null}

        <form action={signIn} className="auth-form">
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="••••••••" required />
          </label>

          <button type="submit">Sign in</button>
        </form>

        <p className="auth-link">
          Need an account? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}
