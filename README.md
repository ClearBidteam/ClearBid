# ClearBid
Online auction platform for household and garage clearances 
clear your clutter let buyers compete

## Current status

Email/password signup and login use Supabase Auth. Confirmed users can access a
protected account page at `/account`; Supabase Auth stores the account records.

## Local development

Install dependencies and start the Next.js app:

```bash
npm install
npm run dev
```

Then visit <http://localhost:3000/>. Signup and login are available at
`/signup` and `/login`.

For local auth, configure Supabase with:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/confirm`

Email confirmation must be enabled and configured for the project to send signup emails.

## Production deployment

Set these environment variables in your hosting provider before deploying:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=https://your-live-domain.com
```

In the Supabase dashboard, set the Site URL to your production domain and add:

- `https://your-live-domain.com/auth/confirm`
- any additional callback URLs you need for auth

For Vercel deployments, `NEXT_PUBLIC_SITE_URL` is the most reliable option; the app will also automatically use `VERCEL_URL` when present.

## Next steps

- Add profile fields in a public table only when the product needs them; Auth
	user records are already managed by Supabase.
- Define listing and bid tables with Row Level Security policies.
- Configure custom SMTP before relying on signup email delivery in production.
