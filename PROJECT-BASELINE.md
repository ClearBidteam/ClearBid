# ClearBid — Project Baseline

> Baseline reference for AI agents working in this repository. Describes what the
> project is, how it is built, its current structure, conventions, and known
> gaps. Keep this file updated as the codebase evolves.

## 1. What this project is

ClearBid is an **online auction platform for household and garage clearances**
("clear your clutter, let buyers compete"). The product already includes
**user authentication**, **seller profile management**, **auction listing
creation**, **live bidding**, **auction summaries**, and **post-sale collection
confirmation**. It is still an early-stage marketplace, but the core auction flow
is implemented.

## 2. Tech stack

| Concern         | Choice                                             |
| --------------- | -------------------------------------------------- |
| Framework       | Next.js **16** (App Router, React Server Components)|
| UI library      | React **19**                                       |
| Language        | TypeScript **7** (strict mode)                     |
| Styling         | Tailwind CSS **4** (via `@tailwindcss/postcss`)    |
| Auth & backend  | Supabase (Auth, SSR cookie sessions)               |
| Deployment      | Vercel-friendly (uses `VERCEL_URL` fallback)       |

Package scripts (`package.json`):

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build (also the only "test" gate; no automated tests)
- `npm run start` — run the production build

## 3. Important Next.js 16 note

This repo uses **Next.js 16**, which has breaking changes versus older versions
that may be in training data. Notable differences visible in this codebase:

- **`proxy.ts` replaces `middleware.ts`.** The root [proxy.ts](proxy.ts) exports
  a `proxy()` function (not `middleware()`) plus a `config.matcher`. Treat it as
  the request middleware entry point.
- `searchParams` in page components is a **`Promise`** and must be `await`ed
  (see [app/login/page.tsx](app/login/page.tsx#L5-L12)).
- `cookies()` from `next/headers` is **async** and must be `await`ed
  (see [utils/supabase/server.ts](utils/supabase/server.ts#L5)).

Before writing Next.js code, consult the bundled docs referenced in
[AGENTS.md](AGENTS.md) at `node_modules/next/dist/docs/`.

## 4. Directory structure

```
app/
  layout.tsx            Root layout: <html>/<body>, global gradient background, metadata
  page.tsx              Home: redirects to /account (signed in) or /signup (signed out)
  globals.css           Tailwind import + base :root / html styles
  account/page.tsx      Protected page; redirects to /login if no user; sign-out form
  actions/auth.ts       Server actions: signIn, signUp, signOut (+ helpers)
  auth/confirm/route.ts Route handler: exchanges email-confirmation code for a session
  login/page.tsx        Login form (reads ?error / ?success query params)
  signup/page.tsx       Signup form (first/last name, email, password; reads ?error)
utils/supabase/
  client.ts             Browser Supabase client (createBrowserClient)
  server.ts             Server Supabase client (createServerClient + cookie bridge)
  middleware.ts         updateSession(): refreshes auth session, re-sets cookies
proxy.ts                Next.js request entry (calls updateSession); route matcher
next.config.ts          Empty Next config
tsconfig.json           Strict TS; path alias "@/*" -> project root
```

## 5. Authentication flow (the one implemented feature)

1. **Signup** — [app/signup/page.tsx](app/signup/page.tsx) posts to the `signUp`
   server action in [app/actions/auth.ts](app/actions/auth.ts#L50). It calls
   `supabase.auth.signUp` with `first_name`, `last_name`, `full_name` user
   metadata and `emailRedirectTo = <site>/auth/confirm`. If email confirmation is
   pending, it redirects to `/login?success=...`.
2. **Email confirmation** — the link lands on
   [app/auth/confirm/route.ts](app/auth/confirm/route.ts), which calls
   `exchangeCodeForSession(code)` and redirects to `/account` on success,
   otherwise to `/login?error=...`.
3. **Login** — [app/login/page.tsx](app/login/page.tsx) posts to `signIn`, which
   calls `signInWithPassword`. It maps `email_not_confirmed` and
   `invalid_credentials` error codes to friendly messages via `?error=`.
4. **Session refresh** — [proxy.ts](proxy.ts) runs `updateSession` on every
   matched request ([utils/supabase/middleware.ts](utils/supabase/middleware.ts)),
   calling `supabase.auth.getClaims()` and rewriting auth cookies.
5. **Protected page** — [app/account/page.tsx](app/account/page.tsx) calls
   `supabase.auth.getUser()`; if there is no user it redirects to `/login`.
6. **Sign out** — the `signOut` server action calls `supabase.auth.signOut()` and
   redirects to `/`.

Error/success messaging is passed between pages via `?error=` / `?success=`
query-string parameters set by `redirectWithError` and read in the page
components.

## 6. Conventions observed

- **Server-first:** Pages and the account view are async Server Components;
  mutations use `"use server"` server actions in `app/actions/`.
- **Import alias:** use `@/` for project-root imports (e.g. `@/utils/supabase/server`).
- **Supabase clients:** never import a client directly — use the factory for the
  context (`client.ts` in the browser, `server.ts` in RSC/actions,
  `middleware.ts` inside the proxy).
- **Env keys:** only the **publishable/anon** key is exposed via
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never put a service-role/secret key in a
  `NEXT_PUBLIC_` variable.
- **Styling:** Tailwind utility classes inline on elements, with arbitrary values
  for the green brand palette (e.g. `#1d7a45`, `#173b2b`). No component library.
- **No comments/docstrings** unless they explain non-obvious intent (see the
  cookie `catch` note in `server.ts`).

## 7. Environment variables

| Variable                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key                    |
| `NEXT_PUBLIC_SITE_URL`                 | Base URL for auth redirect links                 |
| `VERCEL_URL`                           | Auto-used fallback for the site URL on Vercel     |

Put these in a gitignored `.env.local` for local dev. Supabase dashboard must set
Site URL to the app origin and allow `<origin>/auth/confirm` as a redirect URL.

## 8. Dev / test cycle

There are **no automated tests**. The quality gate is manual browser testing plus
`npm run build`. See [DEV-TEST-CYCLE.md](DEV-TEST-CYCLE.md) for the full checklist.
Key points for any change:

1. `npm run dev`, exercise the affected route at desktop and mobile widths.
2. For auth changes, verify signup, confirmation link, login, `/account` access,
   and sign-out.
3. Run `npm run build` and fix any errors before considering the work done.

## 9. Current gaps / planned next steps (from README)

- `seller_profiles`, `auctions`, `bids`, and `seller_reviews` are implemented
  with Supabase RLS policies and supporting database functions.
- Custom SMTP must be configured before relying on signup email in production.
- Payment, winner notifications, and a fuller collection/checkout workflow are
  still required before treating the marketplace as a complete transactional app.
- The home page still acts mainly as a redirect/entry point rather than a full
  marketing landing page.

## 10. Quick orientation for an AI agent

- To change auth behavior: edit [app/actions/auth.ts](app/actions/auth.ts).
- To change auth UI: edit [app/login/page.tsx](app/login/page.tsx) or
  [app/signup/page.tsx](app/signup/page.tsx).
- To change session/cookie handling: edit
  [utils/supabase/middleware.ts](utils/supabase/middleware.ts) and
  [proxy.ts](proxy.ts).
- To add a new protected page: follow the `getUser()` + `redirect("/login")`
  pattern from [app/account/page.tsx](app/account/page.tsx).
- To build listings/bids: add Supabase tables with RLS, create server actions in
  `app/actions/`, and new route segments under `app/`.
