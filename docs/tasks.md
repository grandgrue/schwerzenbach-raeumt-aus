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
- ☐ `backend/sql/schema.sql`: Tabellen `event`, `stand`, `category`, `stand_category`,
  `admin_user` (siehe Datenmodell §3)
- ☐ `backend/sql/seed.sql`: Kategorien, Demo-Event, Admin-User (gehashtes Passwort)

## Phase 2 — Backend-Grundgerüst
- ☐ `composer.json` + Abhängigkeiten (PHPMailer, phpdotenv, phpunit)
- ☐ Konfig-Loader + `config/.env.example`
- ☐ PDO-Verbindung (Prepared Statements)
- ☐ Front-Controller `public/index.php` + Router
- ☐ JSON-Response-/Fehler-Helper + Validierungsschicht

## Phase 3 — Öffentliche API
- ☐ `GET /api/event` *(B4)*
- ☐ `GET /api/categories` *(B2)*
- ☐ `GET /api/stands` inkl. Filter `category`/`food`/`drinks`/`q` *(B1, B2)* — **ohne**
  private Felder
- ☐ `GET /api/stands/{id}` *(B3)*

## Phase 4 — Anbieter-API (kontolos)
- ☐ `POST /api/stands` — Validierung, Honeypot, Captcha, Rate-Limit; Status `pending`;
  Edit-Token erzeugen, Hash speichern *(A1, A1b, A2, A4)*
- ☐ Edit-Link-E-Mail via PHPMailer *(A2)*
- ☐ `GET /api/stands/edit/{token}` *(A3)*
- ☐ `PUT /api/stands/edit/{token}` (+ `edited_after_approval`) *(A3)*
- ☐ `DELETE /api/stands/edit/{token}` *(A3)*

## Phase 5 — Admin-API
- ☐ `POST /api/admin/login` / `POST /api/admin/logout` (Session + CSRF) *(AD1)*
- ☐ `GET /api/admin/stands?status=` *(AD2)*
- ☐ `PATCH /api/admin/stands/{id}` (freigeben/ablehnen/bearbeiten) *(AD2)*
- ☐ `DELETE /api/admin/stands/{id}` *(AD2)*
- ☐ `PUT /api/admin/event` *(AD3)*

## Phase 6 — Frontend-Grundgerüst
- ☐ Vite + React + TS + Tailwind aufsetzen
- ☐ React Router + TanStack Query + API-Client
- ☐ Layout/Navigation (Start, Karte, Liste, Anmelden, FAQ)

## Phase 7 — Besucher-Features
- ☐ Startseite mit Event-Info *(B4)*
- ☐ `MapView` mit Pins + Popup *(B1)*
- ☐ `/liste` mit `FilterBar` (Kategorie/Essen/Getränke/Suche) *(B2)*
- ☐ Detailseite `/stand/:id` *(B3)*
- ☐ `NavigateButton` (Fuss-Navigation via Karten-App) *(B5)*
- ☐ FAQ-Seite inkl. Datenschutz *(B6)*

## Phase 8 — Anbieter-Features
- ☐ `StandForm` + `PinPicker`, Pflicht-Mobilnummer, Wahl der öffentlichen Kontaktangaben,
  Datenschutz-Hinweise, Validierung (zod) *(A1, A1b)*
- ☐ Bestätigungsseite nach Anmeldung *(A2)*
- ☐ Bearbeiten/Zurückziehen über `/bearbeiten/:token` *(A3)*

## Phase 9 — Admin-Features
- ☐ Admin-Login *(AD1)*
- ☐ `AdminStandTable` mit Status-Aktionen *(AD2)*
- ☐ `EventConfigForm` *(AD3)*

## Phase 10 — Tests
- ☐ PHPUnit: Validierung, Auth/CSRF, Stand-Lifecycle, Sichtbarkeit privater Felder
- ☐ Vitest/RTL: Formularvalidierung, Filterlogik, `NavigateButton`-URL, Rendering
- ☐ (optional) Playwright-E2E: Anmeldung → Freigabe → Sichtbarkeit

## Phase 11 — Deployment-Artefakte
- ☐ `deploy/htaccess-root.txt`, `deploy/htaccess-api.txt`
- ☐ `deploy/README-deploy.md` (hoststar-Anleitung)
- ☐ Live-Smoke-Test (nach Bereitstellung der Zugangsdaten)
