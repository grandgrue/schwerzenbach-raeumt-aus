-- Schwerzenbach räumt aus — Seed-Daten
-- Import NACH schema.sql:  mysql <db> < backend/sql/seed.sql
--
-- Enthält: Warenkategorien + ein Demo-Event.
-- Der Admin-Benutzer wird NICHT hier angelegt (kein Passwort-Hash im Repo),
-- sondern via:  php backend/bin/create-admin.php <username> <passwort>

SET NAMES utf8mb4;

-- Kategorien (idempotent) -----------------------------------------------------
INSERT INTO `category` (`name`, `sort_order`) VALUES
  ('Möbel',            10),
  ('Kleider & Schuhe', 20),
  ('Spielwaren',       30),
  ('Bücher & Medien',  40),
  ('Haushalt & Küche', 50),
  ('Elektronik',       60),
  ('Deko & Kunst',     70),
  ('Sport & Freizeit', 80),
  ('Garten',           90),
  ('Kinder & Baby',   100),
  ('Sonstiges',       110)
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`);

-- Demo-Event (nur anlegen, wenn noch keines existiert) ------------------------
INSERT INTO `event`
  (`name`, `event_date`, `default_start_time`, `default_end_time`,
   `registration_open`, `public_spots_total`, `info_text`)
SELECT
  'Schwerzenbach räumt aus',
  NULL,            -- Datum vom OK im Admin-Bereich setzen
  '09:00:00',
  '16:00:00',
  1,               -- Anmeldung offen
  20,              -- Plätze am Gemeindehaus/an der Schule
  'Willkommen beim Flohmarkt-Tag von Schwerzenbach! Das Datum und weitere Infos folgen in Kürze.'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `event`);
