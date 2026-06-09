-- Schwerzenbach räumt aus — Datenbankschema
-- MySQL / MariaDB, InnoDB, utf8mb4
--
-- Referenz: docs/technical-plan.md §3 (Datenmodell)
-- Import:   mysql <db> < backend/sql/schema.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- event: Singleton-Konfiguration des aktuellen Flohmarkt-Tags
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `event` (
  `id`                 INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`               VARCHAR(150)    NOT NULL,
  `event_date`         DATE            NULL,
  `default_start_time` TIME            NULL,
  `default_end_time`   TIME            NULL,
  `registration_open`  TINYINT(1)      NOT NULL DEFAULT 0,
  `public_spots_total` INT UNSIGNED    NOT NULL DEFAULT 0,
  `info_text`          TEXT            NULL,
  `organizer_emails`   TEXT            NULL,
  `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- category: vordefinierte Warenkategorien
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(80)  NOT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- stand: ein angemeldeter Verkaufsstand
-- Sichtbarkeit der Felder siehe docs/technical-plan.md §3.
-- provider_email / provider_mobile sind PRIVAT (nie öffentlich ausliefern).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stand` (
  `id`                    INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `event_id`              INT UNSIGNED   NOT NULL,
  `title`                 VARCHAR(150)   NOT NULL,
  `description`           TEXT           NULL,
  `address`               VARCHAR(255)   NOT NULL,
  `lat`                   DECIMAL(9,6)   NOT NULL,
  `lng`                   DECIMAL(9,6)   NOT NULL,
  -- private Felder (nur Anbieter:in/OK):
  `provider_email`        VARCHAR(255)   NOT NULL,
  `provider_mobile`       VARCHAR(40)    NOT NULL,
  -- öffentlicher Kontakt (nur sichtbar wenn show_public_contact = 1):
  `public_contact_name`   VARCHAR(150)   NULL,
  `public_contact_phone`  VARCHAR(40)    NULL,
  `show_public_contact`   TINYINT(1)     NOT NULL DEFAULT 0,
  -- Verkaufszeiten (NULL => Event-Standard):
  `start_time`            TIME           NULL,
  `end_time`              TIME           NULL,
  -- Angebote / Optionen:
  `offers_food`           TINYINT(1)     NOT NULL DEFAULT 0,
  `offers_drinks`         TINYINT(1)     NOT NULL DEFAULT 0,
  `needs_public_spot`     TINYINT(1)     NOT NULL DEFAULT 0,
  -- Moderation:
  `status`                ENUM('pending','approved','rejected','withdrawn')
                                         NOT NULL DEFAULT 'pending',
  `edited_after_approval` TINYINT(1)     NOT NULL DEFAULT 0,
  -- kontolose Bearbeitung:
  `edit_token_hash`       CHAR(64)       NOT NULL,
  `created_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`            TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                         ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stand_edit_token_hash` (`edit_token_hash`),
  KEY `idx_stand_status` (`status`),
  KEY `idx_stand_event` (`event_id`),
  KEY `idx_stand_public_spot` (`needs_public_spot`, `status`),
  CONSTRAINT `fk_stand_event` FOREIGN KEY (`event_id`)
    REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- stand_category: M:N zwischen Ständen und Kategorien
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stand_category` (
  `stand_id`    INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`stand_id`, `category_id`),
  KEY `idx_sc_category` (`category_id`),
  CONSTRAINT `fk_sc_stand` FOREIGN KEY (`stand_id`)
    REFERENCES `stand` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sc_category` FOREIGN KEY (`category_id`)
    REFERENCES `category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- admin_user: Organisationskomitee-Login (Tabelle erlaubt spätere Mehrbenutzer)
-- Passwort als bcrypt-Hash (password_hash). Anlegen via bin/create-admin.php.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_user` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(80)  NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
