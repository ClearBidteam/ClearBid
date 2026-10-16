# Local Dev-Test Cycle

Use this checklist when making and checking changes to ClearBid locally.

## One-time setup

1. Install Node.js and npm if they are not already installed.
2. Install project dependencies:

   ```bash
   npm install
   ```

3. Configure `.env.local` in the project root with the Supabase project values:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Use the publishable/anon key, never a Supabase service-role or secret key in a
   `NEXT_PUBLIC_` variable. `.env.local` is gitignored; do not commit it.

4. In Supabase Dashboard, set the Auth Site URL to `http://localhost:3000` and
   add `http://localhost:3000/auth/confirm` as a redirect URL. Configure email
   delivery/confirmation if you want to test confirmation links.

## Repeat for each change

1. Start the development server from the project root:

   ```bash
   npm run dev
   ```

2. Open <http://localhost:3000> in a browser. Keep the terminal open to see
   server errors and compilation output. Stop the server with `Ctrl+C`.
3. Test the route and behavior you changed. For signup/auth changes, check:
   - `/signup` displays the expected fields and accepts valid input.
   - Submitting invalid or duplicate credentials shows a useful error.
   - A new signup receives the confirmation email when confirmation is enabled.
   - The confirmation link returns to the local app, and confirmed users can log
     in and reach `/account`.
   - Sign out returns to the signed-out experience; protected pages require login.
4. Check the browser at desktop and narrow/mobile widths for layout issues.
5. Before considering the change done, run a production build:

   ```bash
   npm run build
   ```

   Fix any errors introduced by your change and run the build again.
6. Run the automated validation tests:

   ```bash
   npm test
   ```

## Listing and bidding setup

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor
before testing listing uploads or bids. The script sets up auctions, bid
privacy and policies, storage, public bid summaries, and atomic bid placement.
Then verify the buyer/seller flows using two accounts, including expired
auctions, seller self-bids, competing bids, and bid visibility.

## Troubleshooting

- **Supabase URL/key error:** Check the variable names and values in `.env.local`,
  then restart `npm run dev` after changing environment variables.
- **Email confirmation link fails:** Check the Supabase Site URL and redirect URL
  above, plus email confirmation settings.
- **Port 3000 is busy:** Stop the other dev server, or start Next.js on another
  port with `npm run dev -- --port 3001`; then use the matching URL and update
  Supabase's local Site URL/redirect URL if testing email confirmation.
- **A build fails after local development:** Read the first relevant error in the
  terminal and fix that before continuing to browser testing.