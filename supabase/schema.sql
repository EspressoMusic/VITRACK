-- Run this once in the Supabase SQL editor after creating the project,
-- and enable the Google provider under Authentication > Providers.

create table if not exists meals (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  created_at timestamptz not null,
  image_data_url text not null,
  foods jsonb not null,
  nutrients jsonb not null,
  macros jsonb,
  confidence text not null,
  analysis_note text,
  is_junk_food boolean
);

-- Safe to re-run against an existing table (schema.sql above only applies on first create).
alter table meals add column if not exists is_junk_food boolean;
alter table meals add column if not exists macros jsonb;

create index if not exists meals_user_id_idx on meals (user_id);
create index if not exists meals_date_idx on meals (date);

alter table meals enable row level security;

create policy "Users can read their own meals"
  on meals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meals"
  on meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meals"
  on meals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meals"
  on meals for delete
  using (auth.uid() = user_id);

create table if not exists workouts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  created_at timestamptz not null,
  name text not null,
  done boolean not null default false
);

alter table workouts add column if not exists exercises jsonb not null default '[]'::jsonb;

create index if not exists workouts_user_id_idx on workouts (user_id);
create index if not exists workouts_date_idx on workouts (date);

alter table workouts enable row level security;

create policy "Users can read their own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on workouts for delete
  using (auth.uid() = user_id);

-- Per-caller-IP rate limiting for the public (no-auth) `analyze` and `identify-food`
-- edge functions, so a single caller can't run up unbounded OpenAI spend.
create table if not exists api_rate_limits (
  client_key text primary key,
  window_start timestamptz not null default now(),
  request_count int not null default 0
);

-- RLS enabled with no policies at all: this table is never queried from the client,
-- only from inside the edge functions via the check_rate_limit() function below.
alter table api_rate_limits enable row level security;

create or replace function check_rate_limit(p_client_key text, p_max_requests int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into api_rate_limits (client_key, window_start, request_count)
  values (p_client_key, now(), 1)
  on conflict (client_key) do update
    set request_count = case
          when api_rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else api_rate_limits.request_count + 1
        end,
        window_start = case
          when api_rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else api_rate_limits.window_start
        end
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function check_rate_limit(text, int, int) from public, anon, authenticated;

-- Non-monetary user preferences (onboarding answers + computed goals), synced across
-- devices after Google sign-in. Deliberately does NOT include subscription status —
-- see paddle_subscriptions below for why that can't live in a client-writable table.
create table if not exists profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  subscribed boolean not null default false, -- deprecated: no longer read or trusted by the app
  plan text, -- deprecated: no longer read or trusted by the app
  goals jsonb,
  onboarding_profile jsonb,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);

-- Server-verified subscription status. Written exclusively by the paddle-webhook and
-- link-paddle-subscription edge functions (both use the service-role key via the
-- paddle_upsert_subscription() function below) — there is deliberately no insert/update
-- policy here, so a signed-in user can read only their own row and can never write one.
-- This is the fix for the `profiles.subscribed` hole above: that column could be set to
-- true directly from the browser console by any signed-in user.
create table if not exists paddle_subscriptions (
  paddle_subscription_id text primary key,
  paddle_customer_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null,
  plan text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists paddle_subscriptions_user_id_idx on paddle_subscriptions (user_id);

alter table paddle_subscriptions enable row level security;

create policy "Users can read their own subscription"
  on paddle_subscriptions for select
  using (auth.uid() = user_id);

create or replace function paddle_upsert_subscription(
  p_subscription_id text,
  p_customer_id text,
  p_status text,
  p_plan text,
  p_current_period_end timestamptz,
  p_user_id uuid
) returns void
language sql
security definer
set search_path = public
as $$
  insert into paddle_subscriptions (paddle_subscription_id, paddle_customer_id, status, plan, current_period_end, user_id, updated_at)
  values (p_subscription_id, p_customer_id, p_status, p_plan, p_current_period_end, p_user_id, now())
  on conflict (paddle_subscription_id) do update
  set paddle_customer_id = excluded.paddle_customer_id,
      status = excluded.status,
      plan = coalesce(excluded.plan, paddle_subscriptions.plan),
      current_period_end = excluded.current_period_end,
      user_id = coalesce(excluded.user_id, paddle_subscriptions.user_id),
      updated_at = now();
$$;

revoke all on function paddle_upsert_subscription(text, text, text, text, timestamptz, uuid) from public, anon, authenticated;
grant execute on function paddle_upsert_subscription(text, text, text, text, timestamptz, uuid) to service_role;

-- Sandbox-only twin of paddle_subscriptions. The sandbox edge functions (link-paddle-
-- subscription-sandbox, paddle-webhook-sandbox, manage-subscription-sandbox) must never
-- write into the real paddle_subscriptions table above — a free Paddle Sandbox "purchase"
-- during testing would otherwise leave a row there that the production link-paddle-
-- subscription function treats as a real, authoritative paid subscription and grants Pro
-- access for. This table is that isolation boundary.
create table if not exists paddle_subscriptions_sandbox (
  paddle_subscription_id text primary key,
  paddle_customer_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null,
  plan text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists paddle_subscriptions_sandbox_user_id_idx on paddle_subscriptions_sandbox (user_id);

alter table paddle_subscriptions_sandbox enable row level security;

create policy "Users can read their own sandbox subscription"
  on paddle_subscriptions_sandbox for select
  using (auth.uid() = user_id);

create or replace function paddle_upsert_subscription_sandbox(
  p_subscription_id text,
  p_customer_id text,
  p_status text,
  p_plan text,
  p_current_period_end timestamptz,
  p_user_id uuid
) returns void
language sql
security definer
set search_path = public
as $$
  insert into paddle_subscriptions_sandbox (paddle_subscription_id, paddle_customer_id, status, plan, current_period_end, user_id, updated_at)
  values (p_subscription_id, p_customer_id, p_status, p_plan, p_current_period_end, p_user_id, now())
  on conflict (paddle_subscription_id) do update
  set paddle_customer_id = excluded.paddle_customer_id,
      status = excluded.status,
      plan = coalesce(excluded.plan, paddle_subscriptions_sandbox.plan),
      current_period_end = excluded.current_period_end,
      user_id = coalesce(excluded.user_id, paddle_subscriptions_sandbox.user_id),
      updated_at = now();
$$;

revoke all on function paddle_upsert_subscription_sandbox(text, text, text, text, timestamptz, uuid) from public, anon, authenticated;
grant execute on function paddle_upsert_subscription_sandbox(text, text, text, text, timestamptz, uuid) to service_role;

-- ---------- Online city (visit other players' cities, send guards) ----------

-- Each player's city map, published by the app so other players can visit it. Only the map is
-- stored (buildings, unlocked land, guards at the gate) — no coins, barn or orders. `name` stays
-- null until the player names their city; the app then shows "City #1234" instead, so no real
-- name is ever shown to strangers by default.
create table if not exists city_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text check (name is null or char_length(name) between 1 and 20),
  level int not null default 1,
  city jsonb not null check (octet_length(city::text) < 300000),
  look jsonb check (look is null or octet_length(look::text) < 4000),
  updated_at timestamptz not null default now()
);

create index if not exists city_snapshots_updated_at_idx on city_snapshots (updated_at desc);

alter table city_snapshots enable row level security;

create policy "Signed-in players can visit cities"
  on city_snapshots for select
  to authenticated
  using (true);

create policy "Players publish their own city"
  on city_snapshots for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Players update their own city"
  on city_snapshots for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- A guard one player sent to another's gate. Once per sender → city per (UTC) day. There are no
-- insert/update policies: sending and claiming only happen through send_guard()/claim_guards() below,
-- which enforce the limits.
create table if not exists guard_gifts (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  sent_on date not null default current_date,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  constraint guard_gifts_not_self check (from_user <> to_user),
  constraint guard_gifts_once_a_day unique (from_user, to_user, sent_on)
);

create index if not exists guard_gifts_unclaimed_idx on guard_gifts (to_user) where claimed_at is null;
create index if not exists guard_gifts_from_day_idx on guard_gifts (from_user, sent_on);

alter table guard_gifts enable row level security;

create policy "Players see guards they sent or got"
  on guard_gifts for select
  to authenticated
  using (auth.uid() = from_user or auth.uid() = to_user);

-- Returns 'sent', 'already' (this city got one from you today), 'limit' (5 a day, matches GUARD.sendsPerDay
-- in frontend/src/farm/data/guards.ts) or 'blocked' (no such city / your own city).
create or replace function send_guard(p_to uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_sent int;
begin
  if v_me is null or p_to is null or p_to = v_me then
    return 'blocked';
  end if;
  if not exists (select 1 from city_snapshots where user_id = p_to) then
    return 'blocked';
  end if;
  if exists (select 1 from guard_gifts where from_user = v_me and to_user = p_to and sent_on = current_date) then
    return 'already';
  end if;
  select count(*) into v_sent from guard_gifts where from_user = v_me and sent_on = current_date;
  if v_sent >= 5 then
    return 'limit';
  end if;
  insert into guard_gifts (from_user, to_user) values (v_me, p_to) on conflict do nothing;
  return 'sent';
end;
$$;

revoke all on function send_guard(uuid) from public, anon;
grant execute on function send_guard(uuid) to authenticated;

-- Hands the caller every guard sent to them that they haven't received yet (each one only once).
create or replace function claim_guards()
returns table (id uuid, from_user uuid, from_name text)
language sql
security definer
set search_path = public
as $$
  with claimed as (
    update guard_gifts g
    set claimed_at = now()
    where g.to_user = auth.uid() and g.claimed_at is null
    returning g.id, g.from_user
  )
  select c.id, c.from_user, s.name
  from claimed c
  left join city_snapshots s on s.user_id = c.from_user;
$$;

revoke all on function claim_guards() from public, anon;
grant execute on function claim_guards() to authenticated;
