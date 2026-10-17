# ClearBid
Online auction platform for household and garage clearances 
clear your clutter let buyers compete

## Current status

Email/password signup and login use Supabase Auth. Confirmed users can access a
protected account page at `/account`. Sellers can create auction listings with
photos, buyers can browse active auctions and place bids, and sellers can confirm
collection after a sale. Bid totals are public, while bidder identities are
visible only to the bidder and the auction's seller.

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

Before testing listings and bidding, run [`supabase/schema.sql`](supabase/schema.sql)
in the Supabase SQL Editor. It creates the auction and bid tables, row-level
security policies, the listing image bucket and upload policy, and the database
functions used to display bid summaries and accept bids atomically. Check your
project's Data API settings if these tables are not exposed to the app.

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

- Apply and verify `supabase/schema.sql` in the target Supabase project.
- Test signup, image uploads, listing creation, browsing, and bidding with two
  separate accounts; confirm users cannot see other bidders' identities or bid on
  their own auctions.
- Configure custom SMTP before relying on signup email delivery in production.
- Add payment, winner notification, and a more formal buyer/seller handoff flow
  before treating auction completion as a full marketplace transaction.
