-- Lord of the Holes – Grunddaten (Struktur) für Supabase
-- Spieler, Plätze, Löcher, Runden – abgeleitet aus der App.
-- Handicaps stehen zunächst auf 0; echte Werte kommen im Daten-Umzug.
-- Mehrfaches Ausführen ist unschädlich (on conflict do nothing).

insert into courses (course_id, course_name, course_rating, slope_rating, par) values
  ('goethe',    'Goethe Kurs',    72.0, 131, 72),
  ('feininger', 'Feininger Kurs', 70.4, 122, 71)
on conflict (course_id) do nothing;

insert into rounds (round_id, round_name, course_id, status, stage, sort_order) values
  ('r1', 'Runde 1',  'goethe',    'active',   'qualification', 1),
  ('r2', 'Runde 2',  'goethe',    'upcoming', 'qualification', 2),
  ('r3', 'Runde 3',  'feininger', 'upcoming', 'qualification', 3),
  ('r4', 'Finaltag', 'goethe',    'upcoming', 'final',         4)
on conflict (round_id) do nothing;

insert into players (id, character_name, display_name, alias_name, sort_order) values
  ('florian', 'Florian', 'Florian', 'Sliceron', 1),
  ('mucky',   'Mucky',   'Mucky',   'Gimme',    2),
  ('kio',     'Kio',     'Kio',     'Foredo',   3),
  ('andreas', 'Andreas', 'Andreas', 'Bogeymir', 4),
  ('achim',   'Achim',   'Achim',   'Gangolf',  5),
  ('phillip', 'Phillip', 'Phillip', 'Golfum',   6)
on conflict (id) do nothing;

insert into holes (course_id, hole_number, meters, par, hcp) values
  ('goethe',  1, 345, 4, 11), ('goethe',  2, 474, 5,  5), ('goethe',  3, 155, 3, 13),
  ('goethe',  4, 486, 5,  1), ('goethe',  5, 323, 4,  9), ('goethe',  6, 367, 4,  3),
  ('goethe',  7, 450, 5,  7), ('goethe',  8, 144, 3, 17), ('goethe',  9, 278, 4, 15),
  ('goethe', 10, 379, 4,  6), ('goethe', 11, 180, 3, 18), ('goethe', 12, 335, 4, 10),
  ('goethe', 13, 363, 4,  4), ('goethe', 14, 349, 4, 14), ('goethe', 15, 324, 4, 12),
  ('goethe', 16, 172, 3, 16), ('goethe', 17, 530, 5,  2), ('goethe', 18, 317, 4,  8),
  ('feininger',  1, 338, 4,  9), ('feininger',  2, 142, 3, 17), ('feininger',  3, 483, 5,  3),
  ('feininger',  4, 348, 4,  7), ('feininger',  5, 371, 4,  1), ('feininger',  6, 160, 3, 15),
  ('feininger',  7, 512, 5,  5), ('feininger',  8, 342, 4, 11), ('feininger',  9, 319, 4, 13),
  ('feininger', 10, 340, 4,  8), ('feininger', 11, 155, 3, 18), ('feininger', 12, 487, 5,  2),
  ('feininger', 13, 362, 4,  6), ('feininger', 14, 330, 4, 10), ('feininger', 15, 170, 3, 16),
  ('feininger', 16, 389, 4,  4), ('feininger', 17, 315, 4, 14), ('feininger', 18, 358, 4, 12)
on conflict (course_id, hole_number) do nothing;
