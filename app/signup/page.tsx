import Link from "next/link";

import { signUp } from "@/app/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const errorMessage = params.error ?? "";

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Start selling</p>
        <h1>Create your account</h1>

        {errorMessage ? <p className="message error">{errorMessage}</p> : null}

        <form action={signUp} className="auth-form">
          <label>
            <span>Full name</span>
            <input name="fullName" type="text" placeholder="Alex Buyer" />
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="At least 6 characters" minLength={6} required />
          </label>

          <button type="submit">Create account</button>
        </form>

        <p className="auth-link">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
