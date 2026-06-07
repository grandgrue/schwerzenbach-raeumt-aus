# Schwerzenbach räumt aus

Webanwendung für den gemeindeweiten Flohmarkt-Tag in Schwerzenbach (ZH). Einwohner:innen
melden niederschwellig (ohne Benutzerkonto) einen Verkaufsstand an; das Organisationskomitee
gibt ihn frei, und Besucher:innen entdecken alle Stände über eine **Karte** und eine
**Liste** mit Filter und Suche.

- **Domain:** [schwerzenbach-raeumt-aus.ch](https://schwerzenbach-raeumt-aus.ch)
- **Sprache:** Deutsch

## Entwickelt nach Spec Driven Design

Anforderungen und technischer Plan sind **vor der Implementierung** dokumentiert und bilden
die verbindliche Grundlage für Programmierung und Tests:

| Dokument | Inhalt |
|----------|--------|
| [`docs/specification.md`](docs/specification.md) | **Das WAS** — fachliche Anforderungen, Nutzerrollen, User Stories, Datenschutz |
| [`docs/technical-plan.md`](docs/technical-plan.md) | **Das WIE** — Architektur, Stack, Datenmodell, API-Vertrag, Frontend-Struktur, Deployment |
| [`docs/tasks.md`](docs/tasks.md) | **Umsetzungs-Roadmap** — Aufgaben in Implementierungsreihenfolge |

## Technologie (Kurzfassung)

- **Frontend:** React + TypeScript (Vite), Tailwind CSS, React Router, TanStack Query,
  react-leaflet (OpenStreetMap)
- **Backend:** PHP 8 + MySQL (PDO), REST-API unter `/api`
- **Hosting:** Shared Hosting hoststar.ch (Apache + PHP + MySQL), Single-Domain-Deployment

## Projektstruktur

```
docs/                Spezifikation, technischer Plan, Roadmap
backend/             PHP-REST-API (Deploy-Ziel: public_html/api)
  ├── public/        Front-Controller (index.php)
  ├── src/           Config, Database, Http (Router), Controller, Repository
  ├── sql/           schema.sql + seed.sql
  ├── bin/           CLI-Skripte (create-admin.php)
  └── Dockerfile     PHP + Apache (Dev)
frontend/            React-SPA (Build → Web-Root)  — folgt
deploy/              .htaccess-Vorlagen + hoststar-Deploy-Anleitung
docker-compose.yml   Lokale Dev-Umgebung (API + DB + Frontend)
```

## Lokale Entwicklung mit Docker

Voraussetzung: **Docker Desktop** (https://www.docker.com/products/docker-desktop/).

```bash
# API + Datenbank starten (DB wird aus backend/sql/*.sql initialisiert)
docker compose up --build

# Admin-Benutzer einmalig anlegen
docker compose exec api php bin/create-admin.php admin <passwort>

# Frontend zusätzlich starten (sobald frontend/ existiert)
docker compose --profile frontend up --build
```

- API: http://localhost:8080 (z. B. http://localhost:8080/event)
- Frontend: http://localhost:5173
- DB: localhost:3307 (User `app` / `app`)

> Backend, Frontend und Deploy-Artefakte werden gemäss [`docs/tasks.md`](docs/tasks.md)
> umgesetzt.
