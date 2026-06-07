# Umsetzungs-Roadmap — „Schwerzenbach räumt aus"

> Reihenfolge der Implementierung. Jede Aufgabe verweist auf die zugrunde liegenden
> Anforderungen ([`specification.md`](specification.md)) bzw. den technischen Plan
> ([`technical-plan.md`](technical-plan.md)). Status: ☐ offen · ☑ erledigt.

## Phase 0 — Spezifikation & Dokumentation
- ☑ `docs/specification.md` (Anforderungen, das WAS)
- ☑ `docs/technical-plan.md` (Architektur/Technik, das WIE)
- ☑ `docs/tasks.md` (diese Roadmap)
- ☑ `README.md` mit Projektüberblick & Verweisen aktualisieren

## Phase 1 — Datenbank
- ☑ `backend/sql/schema.sql`: Tabellen `event`, `stand`, `category`, `stand_category`,
  `admin_user` (siehe Datenmodell §3)
- ☑ `backend/sql/seed.sql`: Kategorien + Demo-Event (Admin-User via
  `backend/bin/create-admin.php`, kein Hash im Repo)

## Phase 2 — Backend-Grundgerüst
- ☑ `composer.json` + Abhängigkeiten (PHPMailer, phpunit)
- ☑ Konfig-Loader (`src/Config.php`) + `config/.env.example`
- ☑ PDO-Verbindung (`src/Database.php`, Prepared Statements)
- ☑ Front-Controller `public/index.php` + Router (`src/Http/Router.php`) inkl.
  Fallback-Autoloader (läuft auch ohne Composer)
- ☑ JSON-Response-/Fehler-Helper (`src/Http/Response.php`, `HttpException.php`)
- ☑ Validierungsschicht (`src/Support/Validator.php`)

## Phase 3 — Öffentliche API
- ☑ `GET /api/event` inkl. `public_spots_total` + berechnetem `public_spots_available`
  *(B4, A1c)*
- ☑ `GET /api/categories` *(B2)*
- ☑ `GET /api/stands` inkl. Filter `category`/`food`/`drinks`/`q` *(B1, B2)* — **ohne**
  private Felder
- ☑ `GET /api/stands/{id}` *(B3)*

## Phase 4 — Anbieter-API (kontolos)
- ☑ `POST /api/stands` — Validierung, Honeypot, Captcha (`GET /captcha`), Rate-Limit;
  Status `pending`; Edit-Token erzeugen, Hash speichern; **Platz-Kapazität serverseitig
  prüfen** (`needs_public_spot`) *(A1, A1b, A1c, A2, A4)*
- ☑ Edit-Link-E-Mail via Mailer (PHPMailer/mail/log-Transport) *(A2)*
- ☑ `GET /api/stands/edit/{token}` *(A3)*
- ☑ `PUT /api/stands/edit/{token}` (+ `edited_after_approval`) *(A3)*
- ☑ `DELETE /api/stands/edit/{token}` *(A3)*

## Phase 5 — Admin-API
- ☑ `POST /api/admin/login` / `POST /api/admin/logout` + `GET /api/admin/session`
  (Session + CSRF) *(AD1)*
- ☑ `GET /api/admin/stands?status=` *(AD2)*
- ☑ `PATCH /api/admin/stands/{id}` (freigeben/ablehnen/bearbeiten) *(AD2)*
- ☑ `DELETE /api/admin/stands/{id}` *(AD2)*
- ☑ `PUT /api/admin/event` inkl. `public_spots_total` *(AD3)*
- ☑ Platz-Buchungen sichtbar via `needs_public_spot` in der Admin-Liste *(AD4)*

> **Backend verifiziert** (Docker): öffentliche API, Anbieter-Flow (Captcha, Edit-Link),
> Admin-Moderation (Login/CSRF/Freigabe), Filter, Event-Konfiguration. Bug behoben:
> Volltextsuche `q` (HY093 durch wiederverwendeten Named-Parameter).

## Phase 6 — Frontend-Grundgerüst
- ☑ Vite + React + TS + Tailwind aufsetzen
- ☑ React Router + TanStack Query + API-Client (`src/api/`)
- ☑ Layout/Navigation (Start, Karte, Liste, Anmelden, FAQ)

## Phase 7 — Besucher-Features
- ☑ Startseite mit Event-Info *(B4)*
- ☑ `MapView` mit Pins + Popup *(B1)*
- ☑ `/liste` mit `FilterBar` (Kategorie/Essen/Getränke/Suche) *(B2)*
- ☑ Detailseite `/stand/:id` *(B3)*
- ☑ `NavigateButton` (Fuss-Navigation via Karten-App) *(B5)*
- ☑ FAQ-Seite inkl. Datenschutz *(B6)*

## Phase 8 — Anbieter-Features
- ☑ `StandForm` + `PinPicker`, Pflicht-Mobilnummer, Wahl der öffentlichen Kontaktangaben,
  Datenschutz-Hinweise, Validierung (zod) *(A1, A1b)*
- ☑ Platz-Option am Gemeindehaus/an der Schule inkl. Hinweistext + Anzeige freier Plätze;
  Option deaktivieren wenn ausgebucht *(A1c)*
- ☑ Bestätigungsseite nach Anmeldung *(A2)*; Honeypot + Captcha im Formular
- ☑ Bearbeiten/Zurückziehen über `/bearbeiten/:token` *(A3)*

## Phase 9 — Admin-Features
- ☑ Admin-Login *(AD1)*
- ☑ `AdminStandTable` mit Status-Aktionen *(AD2)*
- ☑ `EventConfigForm` *(AD3)*

> **Frontend verifiziert (Compile):** `npm run build` (tsc --noEmit + Vite) erfolgreich,
> 163 Module, keine Typfehler; API-Proxy `/api` → Backend funktioniert. **Visuelle/Laufzeit-
> Prüfung** im Browser unter http://localhost:5173 noch ausstehend (kein Browser angebunden).

## Phase 10 — Tests
- ☐ PHPUnit: Validierung, Auth/CSRF, Stand-Lifecycle, Sichtbarkeit privater Felder
- ☐ Vitest/RTL: Formularvalidierung, Filterlogik, `NavigateButton`-URL, Rendering
- ☐ (optional) Playwright-E2E: Anmeldung → Freigabe → Sichtbarkeit

## Phase 11 — Deployment-Artefakte
- ☐ `deploy/htaccess-root.txt`, `deploy/htaccess-api.txt`
- ☐ `deploy/README-deploy.md` (hoststar-Anleitung)
- ☐ Live-Smoke-Test (nach Bereitstellung der Zugangsdaten)
