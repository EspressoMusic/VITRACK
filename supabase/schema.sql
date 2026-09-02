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
  confidence text not null,
  analysis_note text,
  is_junk_food boolean
);

-- Safe to re-run against an existing table (schema.sql above only applies on first create).
alter table meals add column if not exists is_junk_food boolean;

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
