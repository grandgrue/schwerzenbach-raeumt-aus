# Deployment-Anleitung — hoststar.ch

Diese Anleitung beschreibt, wie „Schwerzenbach räumt aus" auf dem Shared Hosting von
hoststar.ch (Apache + PHP 8.x + MySQL/MariaDB) unter der Domain
`schwerzenbach-raeumt-aus.ch` in Betrieb genommen wird.

## Zielstruktur auf dem Server

```
public_html/
├── index.html              # React-Build (Frontend)
├── assets/                 # React-Build-Assets
├── schwerzenbach-flag.svg  # Logo/Favicon
├── .htaccess               # SPA-Fallback  (aus deploy/htaccess-root.txt)
└── api/                    # gesamter Inhalt von backend/
    ├── .htaccess           # API-Rewrite   (aus deploy/htaccess-api.txt)
    ├── public/index.php    # Front-Controller
    ├── src/  config/  vendor/  sql/  bin/
    └── composer.json
```

Frontend und API teilen sich dieselbe Domain → **kein CORS**.

## Voraussetzungen

- hoststar-Hosting mit **PHP 8.1+** und einer **MySQL/MariaDB-Datenbank**
- Zugriff via **SFTP/FTP** (und idealerweise **SSH** für `composer`)
- Lokal installiert: **Node.js** (für den Frontend-Build) und **Composer**
  (für die PHP-Abhängigkeiten) — alternativ via Docker (siehe `README.md`)

## 1. Datenbank anlegen

1. Im hoststar-Panel eine MySQL-Datenbank + Benutzer erstellen und Zugangsdaten notieren.
2. Schema und Seed über **phpMyAdmin** importieren (in dieser Reihenfolge):
   - `backend/sql/schema.sql`
   - `backend/sql/seed.sql` (legt Kategorien + Event an; Event-Datum 05.09.2026, im
     Admin-Bereich änderbar)

## 2. Frontend bauen

```bash
cd frontend
npm install
npm run build          # erzeugt frontend/dist/
```

Den **Inhalt** von `frontend/dist/` (nicht den Ordner selbst) nach `public_html/` hochladen.

## 3. Backend vorbereiten und hochladen

```bash
cd backend
composer install --no-dev --optimize-autoloader   # erzeugt vendor/ (inkl. PHPMailer)
```

Den **gesamten** `backend/`-Ordner-Inhalt nach `public_html/api/` hochladen (inkl. `vendor/`).
> Hat hoststar SSH mit Composer, kann `composer install --no-dev` auch direkt auf dem Server
> im Ordner `public_html/api/` ausgeführt werden. Andernfalls `vendor/` lokal erzeugen und
> mit hochladen. (Ohne `vendor/` läuft der Kern dank Fallback-Autoloader trotzdem — aber der
> E-Mail-Versand via PHPMailer benötigt `vendor/`.)

## 4. Konfiguration (`.env`)

`backend/config/.env.example` nach `public_html/api/config/.env` kopieren und ausfüllen:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=<deine_db>
DB_USER=<db_user>
DB_PASS=<db_passwort>

APP_BASE_URL=https://schwerzenbach-raeumt-aus.ch
APP_ENV=prod
APP_SECRET=<langer-zufallswert>         # z. B. `openssl rand -hex 32`

MAIL_TRANSPORT=smtp
MAIL_FROM=noreply@schwerzenbach-raeumt-aus.ch
MAIL_FROM_NAME=Schwerzenbach räumt aus
SMTP_HOST=<hoststar-smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-benutzer>
SMTP_PASS=<smtp-passwort>
SMTP_SECURE=tls

RATE_LIMIT_PER_HOUR=10
```

> Die `.env` enthält Geheimnisse und wird durch die API-`.htaccess` vor direktem Zugriff
> geschützt. Niemals ins Git-Repository aufnehmen.

## 5. .htaccess-Dateien platzieren

- `deploy/htaccess-root.txt` → `public_html/.htaccess` (SPA-Fallback, schliesst `/api` aus)
- `deploy/htaccess-api.txt` → `public_html/api/.htaccess` (leitet auf `public/index.php`,
  sperrt interne Ordner)

## 6. Admin-Benutzer anlegen

Per SSH im Ordner `public_html/api/`:

```bash
php bin/create-admin.php <benutzername> <passwort>
```

Ohne SSH: das Skript lokal gegen die (per SSH-Tunnel oder remote erreichbare) DB ausführen,
oder den Datensatz in `admin_user` mit einem `password_hash()`-Wert manuell einfügen.

## 7. Funktionsprüfung (Smoke-Test)

- `https://schwerzenbach-raeumt-aus.ch/api/event` → JSON der Event-Konfiguration
- `https://schwerzenbach-raeumt-aus.ch/api/categories` → Kategorienliste
- Startseite lädt, `/karte` und `/liste` zeigen Stände
- Testanmeldung über `/anmelden` → E-Mail mit Bearbeitungs-Link kommt an
- `/admin` → Login → Stand freigeben → erscheint öffentlich

## 7a. Datenbank-Migrationen (bei Updates bestehender DB)

Bei Funktionserweiterungen können Schemaänderungen nötig sein. Migrationsskripte liegen unter
`backend/sql/migrations/` und werden via phpMyAdmin auf der **bestehenden** DB ausgeführt
(frische Installationen erhalten alles bereits über `schema.sql`):

- `001_organizer_emails.sql` — fügt `event.organizer_emails` hinzu (Organisator-Benachrichtigungen).
  Danach im Admin-Bereich unter **Event-Konfiguration** die Organisator-E-Mail-Adressen eintragen.

## 8. Aktualisierungen (späteres Re-Deploy)

- **Frontend:** `npm run build` → Inhalt von `dist/` erneut nach `public_html/` hochladen.
- **Backend:** geänderte Dateien nach `public_html/api/` hochladen; bei neuen/aktualisierten
  Abhängigkeiten `composer install --no-dev` erneut ausführen.
- **DB-Migrationen:** Schemaänderungen via phpMyAdmin nachziehen.

## Hinweise

- **HTTPS** im hoststar-Panel aktivieren (Let’s Encrypt); `APP_BASE_URL` auf `https://` setzen.
- Für ein neues Jahr genügt es, im Admin-Bereich Datum, Zeiten und „Anmeldung offen" zu
  aktualisieren — die App ist wiederverwendbar.
