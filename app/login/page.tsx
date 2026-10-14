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
    <main className="grid min-h-screen place-items-center px-3 py-8 sm:px-5">
      <div className="w-full max-w-[540px] rounded-[18px] border border-[#d9e6d8] bg-white/90 p-[22px_18px] shadow-[0_18px_42px_rgba(23,59,43,0.11)] sm:p-8">
        <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#267344]">Welcome back</p>
        <h1 className="m-0 text-4xl leading-[1.08] text-[#173b2b] sm:text-5xl">Login to ClearBid</h1>

        {errorMessage ? (
          <p className="my-[18px] mb-1 rounded-[10px] border border-[#f5b4b4] bg-[#fff1f1] px-3.5 py-3 text-[0.96rem] text-[#a12525]">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="my-[18px] mb-1 rounded-[10px] border border-[#b9dcbf] bg-[#edf9ef] px-3.5 py-3 text-[0.96rem] text-[#1d6b3f]">
            {successMessage}
          </p>
        ) : null}

        <form action={signIn} className="mt-6 flex flex-col gap-[18px]">
          <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
            <span>Email</span>
            <input
              className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="flex flex-col gap-2 font-semibold text-[#29452f]">
            <span>Password</span>
            <input
              className="min-h-12 w-full rounded-[10px] border border-[#c5d7c8] bg-[#f9fbf8] px-3.5 font-[inherit] focus:border-[#1d7a45] focus:outline-2 focus:outline-[#1d7a45]/20"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#1d7a45] px-5 font-bold text-white transition-opacity duration-200 hover:opacity-[0.92]"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-[#58665d]">
          Need an account?{" "}
          <Link className="font-bold text-[#0d6efd] transition-opacity duration-200 hover:opacity-[0.92]" href="/signup">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
