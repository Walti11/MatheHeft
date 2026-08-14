-- Mathe-Heft: Datenbank-Schema für Supabase (Postgres)
-- Ausführen im Supabase-Projekt unter "SQL Editor" -> "New query"

-- Kinderprofile, verknüpft mit dem Eltern-Account (auth.users)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  avatar text default '⭐',
  points integer default 0,
  created_at timestamptz default now()
);

-- Abgeschlossene Rechnungsblöcke (History)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  stage_key text not null,
  category text not null,
  diff_key text not null,
  block_size integer not null,
  mul_series integer,
  correct integer not null,
  total integer not null,
  note numeric(3,2) not null,
  time_seconds numeric not null,
  tasks jsonb not null,          -- Array der einzelnen Aufgaben (Text, Antwort, richtig/falsch)
  created_at timestamptz default now()
);

-- Bestzeiten pro Kombination (Stufe/Kategorie/Schwierigkeit/Blockgrösse/Reihe)
create table best_times (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  combo_key text not null,        -- gleiche Logik wie bisheriges comboKey()
  seconds numeric not null,
  achieved_at timestamptz default now(),
  unique (profile_id, combo_key)
);

-- Row Level Security: Eltern sehen nur ihre eigenen Kinderprofile/Daten
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table best_times enable row level security;

create policy "Eltern verwalten eigene Profile"
  on profiles for all
  using (auth.uid() = parent_id);

create policy "Eltern sehen Sessions ihrer Kinder"
  on sessions for all
  using (profile_id in (select id from profiles where parent_id = auth.uid()));

create policy "Eltern sehen Bestzeiten ihrer Kinder"
  on best_times for all
  using (profile_id in (select id from profiles where parent_id = auth.uid()));

-- Atomarer Punkte-Zuwachs, um Race Conditions beim Update aus dem Client zu vermeiden
create or replace function add_points(p_profile_id uuid, p_delta integer)
returns integer
language sql
as $$
  update profiles set points = points + p_delta
  where id = p_profile_id
  returning points;
$$;
