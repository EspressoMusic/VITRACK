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
  analysis_note text
);

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
