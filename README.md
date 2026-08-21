# Vitrack

A web app that photographs your meals, estimates the vitamins & minerals they
contain, and tracks where your diet is falling short over time.

- **Camera** — capture or upload a photo of a meal; an AI vision model
  identifies the food and estimates its nutrient content.
- **Calendar** — a monthly view color-coded by how well each day covered your
  daily vitamin/mineral targets; tap a day to see its meals and totals.
- **Insights** — your average intake over the last 7 logged days, with
  deficiencies flagged and natural, whole-food sources suggested for each.
- **Settings** — light/dark mode, Google sign-in, and full control over your data.

By default all meal photos and history are stored **only in your browser**
(IndexedDB) — no account needed. Signing in with Google (optional, requires
Supabase — see below) syncs your meal history to your account so it's
available across devices.

## Project layout

```
frontend/   React + Vite + Tailwind app (the UI)
backend/    Small Express server that calls the OpenAI API to analyze photos
supabase/   SQL schema + edge function for optional accounts/sync (see below)
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and add your own OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

Get a key at https://platform.openai.com/api-keys. This key stays on
your machine in `.env` (already git-ignored) — never commit it or paste it
into a chat.

Start the backend:

```bash
npm run dev
```

It listens on http://localhost:4000.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173). The frontend proxies
`/api/*` requests to the backend automatically in dev.

### 3. Optional: accounts & cross-device sync (Supabase)

The app works fully without this — it's only needed for Google sign-in and
syncing meal history across devices. Skip it to keep everything local-only.

1. Create a free project at https://supabase.com/dashboard.
2. In **Authentication > Providers**, enable **Google** (you'll need a Google
   Cloud OAuth client ID/secret — Supabase's docs walk through this) and add
   your app's URL to the redirect allow-list.
3. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql) —
   this creates the `meals` table with row-level security so each user only
   ever sees their own data.
4. Deploy the account-deletion function (needs the Supabase CLI):
   ```bash
   supabase functions deploy delete-account --project-ref <your-project-ref>
   ```
5. In `frontend/.env` (copy from `frontend/.env.example`), add:
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your anon/public key>
   ```
6. Restart the frontend dev server.

Once configured, "Sign in with Google" appears in Settings. The first sign-in
automatically uploads any meals already stored locally in that browser.

### Using the camera on a phone

Browsers only allow camera access on `https://` or `localhost`. To test on
your phone over your local network, either:
- use a tool like `ngrok`/Vite's `--host` with HTTPS, or
- just use the "Upload a photo" button, which works over plain HTTP too.

## Notes on accuracy

Nutrient estimates come from an AI model reading the photo — they're
approximate, not a substitute for professional dietary or medical advice.
Daily targets used for comparison are general adult reference values, not
personalized to your age, sex, or health conditions.

## Building for production

The `backend/` Express server is for local development only — it has no
authentication and is never called by a production build. In production the
frontend talks to Supabase Edge Functions instead (see `supabase/functions/`),
which do enforce a subscription check (see "Accounts & billing" below).

```bash
cd frontend && npm run build   # outputs frontend/dist
supabase functions deploy analyze
supabase functions deploy identify-food
supabase functions deploy link-paddle-subscription
supabase functions deploy manage-subscription
supabase functions deploy paddle-webhook --no-verify-jwt
supabase functions deploy delete-account
```

Serve `frontend/dist` with any static host, with `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` set at build time (see "Optional: accounts &
cross-device sync" above) — without them the app falls back to calling
`/api/*`, which only exists in local dev.

### Accounts & billing (Paddle)

`analyze` and `identify-food` are paid features: they require a signed-in
Supabase session belonging to an account with an active row in
`paddle_subscriptions` (checked server-side in
`supabase/functions/_shared/subscription.ts` — the client's local "subscribed"
flag is never trusted). That table is written only by the `paddle-webhook`
and `link-paddle-subscription` functions, verified against Paddle directly.
`manage-subscription` lets a signed-in user switch between the monthly/yearly
plan or cancel (access continues until the paid period ends, then billing
stops — no further charges), calling the Paddle API directly with
`PADDLE_API_KEY`; before charging real money make sure:
- `PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`, `PADDLE_PRICE_MONTHLY`,
  `PADDLE_PRICE_YEARLY` are set as Supabase function secrets.
- The Paddle webhook is pointed at your deployed `paddle-webhook` function URL.
- `VITE_PADDLE_CLIENT_TOKEN`, `VITE_PADDLE_PRICE_MONTHLY`,
  `VITE_PADDLE_PRICE_YEARLY` are set in the frontend build.
