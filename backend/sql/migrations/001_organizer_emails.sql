-- Migration v2 (001): Organisator-E-Mail-Adressen am Event
-- Für bereits bestehende Datenbanken (frische DBs erhalten die Spalte via schema.sql).
-- Import z. B. über phpMyAdmin.

ALTER TABLE `event`
  ADD COLUMN `organizer_emails` TEXT NULL AFTER `info_text`;
