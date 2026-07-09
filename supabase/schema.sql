-- Lord of the Holes – Datenbank-Bauplan für Supabase (PostgreSQL)
-- Abgeleitet 1:1 aus dem aktuellen Datenmodell der App (Google-Sheet-Ersatz).
-- Wird später einmalig im Supabase SQL-Editor ausgeführt.

-- ------------------------------------------------------------------
-- Spieler
-- ------------------------------------------------------------------
create table if not exists players (
  id                   text primary key,
  character_name       text    not null default '',
  display_name         text    not null default '',
  alias_name           text    not null default '',
  sort_order           int     not null default 0,
  handicap_index       numeric not null default 0,
  course_hcp_goethe    numeric not null default 0,
  course_hcp_feininger numeric not null default 0
);

-- ------------------------------------------------------------------
-- Plätze
-- ------------------------------------------------------------------
create table if not exists courses (
  course_id     text primary key,
  course_name   text not null default '',
  course_rating numeric,
  slope_rating  int,
  par           int
);

-- ------------------------------------------------------------------
-- Runden
-- ------------------------------------------------------------------
create table if not exists rounds (
  round_id   text primary key,
  round_name text not null default '',
  course_id  text references courses(course_id),
  status     text not null default 'upcoming',   -- active | upcoming | done
  stage      text not null default 'qualification', -- qualification | final
  sort_order int  not null default 0
);

-- ------------------------------------------------------------------
-- Löcher (je Platz 18)
-- ------------------------------------------------------------------
create table if not exists holes (
  course_id   text references courses(course_id),
  hole_number int  not null,
  meters      int,
  par         int,
  hcp         int,
  primary key (course_id, hole_number)
);

-- ------------------------------------------------------------------
-- Welche Spieler spielen in welcher Runde
-- ------------------------------------------------------------------
create table if not exists round_players (
  round_id  text references rounds(round_id),
  player_id text references players(id),
  primary key (round_id, player_id)
);

-- ------------------------------------------------------------------
-- Scores: offizieller Score + Kontroll-Score (Zähler) je Loch.
-- "is_control" ersetzt sauber die alte Krücke (scorer_player_id = player_id).
-- ------------------------------------------------------------------
create table if not exists scores (
  round_id         text        not null,
  player_id        text        not null,
  hole_number      int         not null,
  is_control       boolean     not null default false,
  scorer_player_id text        not null default '',
  strokes          int,
  putts_count      int,
  picked_up        boolean     not null default false,
  over_two_putts   boolean     not null default false,
  lady             boolean     not null default false,
  updated_at       timestamptz not null default now(),
  primary key (round_id, player_id, hole_number, is_control)
);

-- ------------------------------------------------------------------
-- Team-Auslosung (Tageswertungen r1–r3)
-- ------------------------------------------------------------------
create table if not exists team_draw (
  id           bigint generated always as identity primary key,
  draw_key     text,
  round_id     text,
  round_name   text,
  team_number  text,
  player_id    text,
  player_name  text,
  player_alias text,
  sort_order   int         not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  is_test      boolean     not null default false
);

-- ------------------------------------------------------------------
-- Flight-Auslosung: die App behandelt das als ein zusammenhängendes
-- Objekt -> als JSON in einer Zeile speichern.
-- ------------------------------------------------------------------
create table if not exists flight_draw (
  id         int primary key default 1,
  draw       jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Globaler App-Zustand (genau eine Zeile, id = 1)
-- ------------------------------------------------------------------
create table if not exists app_state (
  id                          int primary key default 1,
  app_locked                  boolean not null default true,
  full_reset_at               text    not null default '',
  scores_reset_at             text    not null default '',
  device_assignments_reset_at text    not null default '',
  updated_at                  timestamptz not null default now()
);

insert into app_state (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------------
-- Sicherheit: Row Level Security an, KEIN direkter Zugriff von außen.
-- Der Zugriff läuft ausschließlich über die Server-Funktion (Vercel),
-- die den geheimen service_role-Schlüssel nutzt und RLS umgeht.
-- Damit kann niemand mit dem öffentlichen Schlüssel Daten lesen/ändern.
-- ------------------------------------------------------------------
alter table players       enable row level security;
alter table courses       enable row level security;
alter table rounds        enable row level security;
alter table holes         enable row level security;
alter table round_players enable row level security;
alter table scores        enable row level security;
alter table team_draw     enable row level security;
alter table flight_draw   enable row level security;
alter table app_state     enable row level security;
-- (bewusst keine "policies" -> anon/public-Schlüssel darf gar nichts)
