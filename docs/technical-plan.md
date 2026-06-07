# Technischer Plan — „Schwerzenbach räumt aus"

> **Das WIE.** Dieses Dokument beschreibt Architektur, Technologie-Stack, Datenmodell,
> API-Vertrag, Frontend-Struktur, Sicherheit und Deployment. Fachliche Anforderungen siehe
> [`specification.md`](specification.md).

## 1. Architektur-Überblick

Single-Domain-Deployment auf hoststar.ch (Apache + PHP + MySQL). Das React-Frontend wird zu
statischen Dateien gebaut und im Web-Root abgelegt; die PHP-REST-API liegt unter `/api`.
Da Frontend und API dieselbe Origin haben, ist **kein CORS** nötig.

```
                 ┌──────────────────────── Apache (hoststar.ch) ───────────────────────┐
Browser ───────▶ │  /            → React-SPA (statische Dateien, index.html)            │
                 │  /api/*       → PHP Front-Controller (public/index.php) ─▶ MySQL     │
                 └─────────────────────────────────────────────────────────────────────┘
```

- `.htaccess` (Root): unbekannte Pfade → `index.html` (SPA-Fallback), `/api` ausgenommen.
- `.htaccess` (`/api`): alle Anfragen → `index.php` (Front-Controller-Routing).

## 2. Technologie-Stack

### Frontend
- **React 18** + **TypeScript**, Build mit **Vite**
- **Tailwind CSS** für Styling
- **React Router v6** (SPA-Routing; Server-Fallback via `.htaccess`)
- **TanStack Query** (Daten-Fetching/Caching gegen die API)
- **react-leaflet** + **Leaflet** (Karte/Pins, OpenStreetMap-Tiles)
- **react-hook-form** + **zod** (Formulare + Validierung)

### Backend
- **PHP 8.x** mit **PDO** (MySQL, ausschliesslich Prepared Statements)
- Schlanker eigener **Front-Controller + Router** (keine schwere Framework-Abhängigkeit →
  deployment-freundlich auf Shared Hosting). Alternative bei Bedarf: Slim Framework.
- **Composer**-Abhängigkeiten:
  - **PHPMailer** — E-Mail-Versand (Bearbeitungs-Link) über hoststar-SMTP
  - **vlucas/phpdotenv** — Konfiguration aus `.env`
  - **phpunit** — Tests (Dev)
  - `vendor/` wird mit deployt (kein Composer auf dem Server nötig)
- Admin-Auth: **PHP-Session** (httpOnly-Cookie) + **CSRF-Token** für mutierende Requests

### Datenbank
- **MySQL / MariaDB** (auf hoststar bereitgestellt)

## 3. Datenmodell

### Tabelle `event` (Singleton-Konfiguration)
| Spalte | Typ | Hinweise |
|--------|-----|----------|
| `id` | INT PK AI | |
| `name` | VARCHAR | z. B. „Schwerzenbach räumt aus 2026" |
| `event_date` | DATE | Event-Tag |
| `default_start_time` | TIME | Standard-Verkaufsbeginn |
| `default_end_time` | TIME | Standard-Verkaufsende |
| `registration_open` | TINYINT(1) | Anmeldung offen/geschlossen |
| `public_spots_total` | INT | Anzahl Plätze am Gemeindehaus/an der Schule (Kapazität) |
| `info_text` | TEXT | öffentlicher Infotext (Startseite) |
| `created_at`, `updated_at` | TIMESTAMP | |

### Tabelle `stand`
| Spalte | Typ | Sichtbarkeit | Hinweise |
|--------|-----|--------------|----------|
| `id` | INT PK AI | öffentlich | |
| `event_id` | INT FK → event | – | |
| `title` | VARCHAR | öffentlich | |
| `description` | TEXT | öffentlich | |
| `address` | VARCHAR | öffentlich | Standort-Text |
| `lat` | DECIMAL(9,6) | öffentlich | Pin |
| `lng` | DECIMAL(9,6) | öffentlich | Pin |
| `provider_email` | VARCHAR | **privat** | nur für Edit-Link |
| `provider_mobile` | VARCHAR | **privat** | Pflicht, nur fürs OK |
| `public_contact_name` | VARCHAR NULL | öffentlich* | *nur wenn freigegeben |
| `public_contact_phone` | VARCHAR NULL | öffentlich* | *nur wenn freigegeben |
| `show_public_contact` | TINYINT(1) | – | steuert Anzeige öffentl. Kontakt |
| `start_time` | TIME NULL | öffentlich | Default = Event |
| `end_time` | TIME NULL | öffentlich | Default = Event |
| `offers_food` | TINYINT(1) | öffentlich | Essen auf Spendenbasis |
| `offers_drinks` | TINYINT(1) | öffentlich | Getränke auf Spendenbasis |
| `needs_public_spot` | TINYINT(1) | – | Platz am Gemeindehaus/an der Schule gebucht |
| `status` | ENUM | – | `pending`,`approved`,`rejected`,`withdrawn` |
| `edited_after_approval` | TINYINT(1) | – | Markierung „bearbeitet" fürs OK |
| `edit_token_hash` | VARCHAR UNIQUE | – | Hash des Bearbeitungs-Tokens |
| `created_at`, `updated_at` | TIMESTAMP | – | |

### Tabelle `category`
`id` INT PK AI · `name` VARCHAR · `sort_order` INT

**Seed-Kategorien:** Möbel · Kleider & Schuhe · Spielwaren · Bücher & Medien ·
Haushalt & Küche · Elektronik · Deko & Kunst · Sport & Freizeit · Garten · Kinder & Baby ·
Sonstiges

### Tabelle `stand_category` (M:N)
`stand_id` FK → stand · `category_id` FK → category · PK (`stand_id`,`category_id`)

### Tabelle `admin_user`
`id` INT PK AI · `username` VARCHAR UNIQUE · `password_hash` VARCHAR
(Passwort-Hash via `password_hash()`/bcrypt; Tabelle erlaubt spätere Mehrbenutzer)

## 4. API-Vertrag (JSON, Basis `/api`)

Antworten sind JSON; Fehler als `{ "error": { "code", "message", "fields"? } }` mit
passendem HTTP-Status. Mutierende Admin-Requests erfordern Session + CSRF-Header.

### Öffentlich
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| GET | `/api/event` | aktive Event-Konfiguration inkl. `public_spots_total` und `public_spots_available` (berechnete freie Plätze) |
| GET | `/api/categories` | Kategorienliste |
| GET | `/api/stands` | **freigegebene** Stände, nur öffentliche Felder. Filter: `?category=`, `?food=1`, `?drinks=1`, `?q=` |
| GET | `/api/stands/{id}` | einzelner freigegebener Stand (öffentlich) |

> **Wichtig:** Öffentliche Endpunkte liefern **niemals** `provider_email` oder
> `provider_mobile`. `public_contact_*` nur, wenn `show_public_contact = 1`.

> **Platz-Kapazität:** `public_spots_available = public_spots_total − (Anzahl Stände mit
> `needs_public_spot=1` und Status ≠ `rejected`/`withdrawn`)`. Dieser Wert steuert die
> Anzeige der freien Plätze und die serverseitige Durchsetzung beim `POST`/`PUT` von Ständen.

### Anbieter:in (kontolos, Token)
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| POST | `/api/stands` | Stand anmelden (Honeypot + Captcha + Rate-Limit). Setzt Status `pending`, sendet Edit-Link-Mail. Nur wenn `registration_open`. Bei `needs_public_spot=1` wird die Kapazität **serverseitig** geprüft; ist sie erschöpft, wird mit Fehler `public_spots_full` abgelehnt. |
| GET | `/api/stands/edit/{token}` | eigenen Stand inkl. privater Felder laden |
| PUT | `/api/stands/edit/{token}` | eigenen Stand aktualisieren (bei zuvor freigegebenem Stand → `edited_after_approval = 1`) |
| DELETE | `/api/stands/edit/{token}` | Stand zurückziehen (`withdrawn`) |

### Admin (Session + CSRF)
| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| POST | `/api/admin/login` | Login (Benutzer + Passwort) → Session |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/stands?status=` | alle Stände inkl. privater Felder |
| PATCH | `/api/admin/stands/{id}` | freigeben/ablehnen/bearbeiten |
| DELETE | `/api/admin/stands/{id}` | löschen |
| PATCH | `/api/admin/stands/{id}` | Stand vollständig bearbeiten (Felder ohne `status`) |
| PUT | `/api/admin/event` | Event-Konfiguration speichern |
| GET | `/api/admin/categories` | Kategorien inkl. `stand_count` |
| POST | `/api/admin/categories` | Kategorie anlegen (Name eindeutig) |
| PATCH | `/api/admin/categories/{id}` | Kategorie umbenennen / Reihenfolge |
| DELETE | `/api/admin/categories/{id}` | Kategorie löschen — **nur wenn `stand_count = 0`** (sonst `409 category_in_use`) |

## 5. Frontend — Seiten & Komponenten

### Seiten (Routes)
| Route | Inhalt |
|-------|--------|
| `/` | Startseite: Event-Datum, Verkaufszeiten, Infotext, CTAs |
| `/karte` | Leaflet-Karte mit Pins + Filterleiste |
| `/liste` | filter-/sortierbare Liste der Stände |
| `/stand/:id` | Detailseite inkl. „Zu Fuss hinnavigieren"-Button |
| `/anmelden` | Anmeldeformular mit Pin-Picker + Datenschutz-Hinweise |
| `/bearbeiten/:token` | Stand bearbeiten / zurückziehen |
| `/faq` | FAQ inkl. Datenschutz |
| `/admin` | Admin-Login + Moderations-Dashboard + Event-Konfiguration |

### Kern-Komponenten
- **`MapView`** — Leaflet-Karte, lädt freigegebene Stände, rendert Marker
- **`PinPicker`** — Klick auf Karte setzt/verschiebt den Stand-Pin (im Formular)
- **`FilterBar`** — Kategorie-, Essen-/Getränke- und Freitextfilter
- **`StandCard`** — Listen-/Popup-Darstellung eines Stands
- **`StandForm`** — Anmelde-/Bearbeitungsformular (react-hook-form + zod)
- **`NavigateButton`** — baut aus Koordinaten eine `geo:`- bzw. Maps-URL im
  Fussgänger-Modus und öffnet die Karten-App des Geräts
- **`AdminStandTable`** — Moderationsliste mit Status-Aktionen
- **`EventConfigForm`** — Event-Konfiguration

### Adress-Geocoding (Anmeldeformular)
Beim Anmelden/Bearbeiten wird der Pin **automatisch gesetzt**: Die eingegebene Adresse wird
mit Suffix „8603 Schwerzenbach, Schweiz" über **Nominatim (OpenStreetMap)** geocodiert
(`https://nominatim.openstreetmap.org/search`). Treffer setzt `lat`/`lng`; der Marker bleibt
**verschiebbar** (manuelle Korrektur). Auslösung per Button und automatisch beim Verlassen
des Adressfelds.

### Fuss-Navigation (Detail)
`NavigateButton` erzeugt eine plattformfreundliche URL aus `lat`/`lng`, z. B.
`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>&travelmode=walking`
(bzw. `geo:`-URI als Fallback). Die eigentliche Turn-by-turn-Navigation übernimmt die
Karten-App des Geräts.

## 6. Sicherheit

- **SQL:** ausschliesslich PDO Prepared Statements.
- **XSS:** React escaped standardmässig; serverseitig keine HTML-Ausgabe von Nutzereingaben.
- **Edit-Token:** `bin2hex(random_bytes(32))`; in DB nur der **Hash** (`hash('sha256', …)`),
  Vergleich per konstantzeitigem Hash-Lookup.
- **Admin-Auth:** PHP-Session (httpOnly, `SameSite=Lax`), Passwörter via `password_hash()`
  (bcrypt). CSRF-Token für alle mutierenden Admin-Requests.
- **Spam:** Honeypot-Feld + serverseitige Rechenfrage + Rate-Limit pro IP.
- **Datensparsamkeit:** private Felder werden nur in Anbieter-/Admin-Kontext serialisiert.

## 7. Projektstruktur (Repository)

```
/
├── README.md
├── docs/
│   ├── specification.md      # Das WAS (Anforderungen)
│   ├── technical-plan.md     # Das WIE (dieses Dokument)
│   └── tasks.md              # Umsetzungs-Roadmap / Aufgabenliste
├── backend/
│   ├── public/index.php      # Front-Controller (Deploy-Ziel: public_html/api/)
│   ├── src/                  # Router, Controller, Repositories, Mailer, Auth, Validation
│   ├── config/               # .env.example, Konfig-Loader
│   ├── sql/
│   │   ├── schema.sql        # Tabellen
│   │   └── seed.sql          # Kategorien, Demo-Event, Admin-User
│   ├── tests/                # PHPUnit
│   └── composer.json
├── frontend/
│   ├── src/                  # React-App (pages, components, api-client, hooks)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── deploy/
    ├── htaccess-root.txt     # SPA-Fallback-Vorlage
    ├── htaccess-api.txt      # API-Rewrite-Vorlage
    └── README-deploy.md      # hoststar-Deploy-Anleitung
```

## 8. Deployment (hoststar.ch)

1. **Frontend bauen:** `npm run build` → Inhalt von `frontend/dist/` in den Web-Root
   (`public_html/`) hochladen.
2. **Backend hochladen:** `backend/` inkl. `vendor/` nach `public_html/api/`.
3. **Konfiguration:** `.env` mit DB-Zugang und SMTP-Daten anlegen (nicht versioniert).
4. **Datenbank:** `sql/schema.sql` und `sql/seed.sql` via phpMyAdmin importieren;
   Admin-Passwort-Hash setzen.
5. **.htaccess:** Root-Variante (SPA-Fallback) und API-Variante (Rewrite auf `index.php`)
   aus `deploy/` übernehmen.
6. **E-Mail:** PHPMailer auf hoststar-SMTP konfigurieren; Absenderadresse auf
   `@schwerzenbach-raeumt-aus.ch`.

## 9. Lokale Entwicklung

- **Backend:** `php -S localhost:8000 -t backend/public` + lokale MySQL (oder Docker);
  `schema.sql` + `seed.sql` einspielen.
- **Frontend:** `npm run dev` (Vite-Dev-Server) mit Proxy `/api` → `http://localhost:8000`.

## 10. Tests

- **Backend (PHPUnit):** Validierung, Auth/CSRF, Stand-Lifecycle (anlegen → moderieren →
  bearbeiten → zurückziehen), Sichtbarkeit privater Felder.
- **Frontend (Vitest + React Testing Library):** Formularvalidierung, Filterlogik,
  `NavigateButton`-URL-Erzeugung, Rendering von Karte/Liste.
- **Optional E2E (Playwright):** kompletter Ablauf Anmeldung → Freigabe → Sichtbarkeit.
