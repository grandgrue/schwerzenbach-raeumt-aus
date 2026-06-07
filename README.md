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
docs/        Spezifikation, technischer Plan, Roadmap
backend/     PHP-REST-API (Deploy-Ziel: public_html/api)
frontend/    React-SPA (Build → Web-Root)
deploy/      .htaccess-Vorlagen + hoststar-Deploy-Anleitung
```

> Backend, Frontend und Deploy-Artefakte werden gemäss [`docs/tasks.md`](docs/tasks.md)
> umgesetzt.
