-- Migration (003): Pausenmodus / Nachsaison
-- Neue Spalte `paused` am Event. Ist sie 1, zeigt die öffentliche Website den
-- Pausenmodus (Platzhalter-Startseite + Rückblick, keine Karte/Liste/Anmeldung).
-- Bestehende Daten bleiben unverändert; Default 0 = normales Verhalten wie bisher.
--
-- Import z. B. über phpMyAdmin. Idempotenz: Spalte nur anlegen, falls sie fehlt.

ALTER TABLE `event`
  ADD COLUMN `paused` TINYINT(1) NOT NULL DEFAULT 0 AFTER `registration_open`;
