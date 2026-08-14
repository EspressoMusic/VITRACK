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

```bash
cd frontend && npm run build   # outputs frontend/dist
cd backend && npm start        # run the API server (set OPENAI_API_KEY in the environment)
```

Serve `frontend/dist` with any static host, and point it at your deployed
backend's `/api` routes (update the proxy/base URL for production as needed).
