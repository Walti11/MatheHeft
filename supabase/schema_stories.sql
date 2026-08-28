-- Mathe-Heft: Datenbank-Schema fuer das Geschichten-Modul
-- Ausfuehren im Supabase-Projekt unter "SQL Editor" -> "New query"
-- (setzt voraus, dass supabase/schema.sql bereits ausgefuehrt wurde, da profiles referenziert wird)

-- Fortlaufende Serien mit denselben Hauptfiguren
create table story_sagas (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  characters jsonb not null,      -- Array von Namen, z.B. ["Giuseppe der Baer", "Peter der Polizist"]
  summary text default '',        -- laufende Kurz-Zusammenfassung fuer die naechste Fortsetzung
  chapter_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Einzelne Geschichten/Kapitel (sowohl Tagesthema als auch Serien-Kapitel)
create table story_chapters (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  saga_id uuid references story_sagas(id) on delete cascade,   -- NULL bei Tagesthema-Geschichten
  mode text not null check (mode in ('topical', 'saga')),
  topic_key text,                 -- nur bei mode = 'topical'
  level_key text not null,
  chapter_number integer not null default 1,
  title text not null,
  content text not null,
  new_words jsonb default '[]',   -- Array von {word, explanation}
  created_at timestamptz default now()
);

alter table story_sagas enable row level security;
alter table story_chapters enable row level security;

create policy "Eltern verwalten Serien ihrer Kinder"
  on story_sagas for all
  using (profile_id in (select id from profiles where parent_id = auth.uid()));

create policy "Eltern verwalten Geschichten ihrer Kinder"
  on story_chapters for all
  using (profile_id in (select id from profiles where parent_id = auth.uid()));
