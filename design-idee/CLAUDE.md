# CLAUDE.md — Redesign Schwerzenbach räumt aus

## Deine Aufgabe
Gestalte die bestehende Website unter `schwerzenbach-raeumt-aus.ch` vollständig nach dem neuen Design System um. Das Design System ist in `design-system-schwerzenbach.html` dokumentiert.

---

## Design System

### Farben (CSS Custom Properties)
Ersetze alle bestehenden Farb-Definitionen durch diese Tokens:

```css
:root {
  --color-primary:    #F5B731;   /* Marktgelb — Primärfarbe, Logo */
  --color-primary-lt: #FDE68A;   /* Honiggelb — Karten, Tags */
  --color-primary-bg: #FFF8DC;   /* Cremesonne — Seiten-Hintergrund */
  --color-accent:     #FF8C5A;   /* Sommerkorall — Buttons, CTAs */
  --color-accent-dk:  #E06930;   /* Korall Dunkel — Hover-States */
  --color-ink:        #5A4A2A;   /* Karamell — Body-Text */
  --color-ink-dark:   #2E2416;   /* Tiefdunkel — Headlines, Navbar, Footer */
  --color-ink-light:  #9C856A;   /* Hellkaramell — Captions, Labels */
  --color-surface:    #FFFFFF;   /* Weiss — Karten-Hintergrund */
  --color-border:     #EDCF88;   /* Goldrand — Trennlinien, Card-Borders */
}
```

### Schriften
```css
/* Google Fonts einbinden (im <head>) */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&family=Bebas+Neue&display=swap');

--font-display: 'Bebas Neue', 'Arial Narrow', sans-serif;  /* Headlines, Hero */
--font-body:    'Nunito', 'Trebuchet MS', sans-serif;       /* Fliesstext, Buttons */
```

**Typografie-Regeln:**
- Alle `<h1>`, `<h2>`, `<h3>` → `font-family: var(--font-display)`
- Alle `<h4>`, Body-Text, Buttons → `font-family: var(--font-body); font-weight: 900`
- Eyebrows (kleine Übertitel) → `font-size: 0.7rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-accent)`

### Abstände (8px-Raster)
Nutze konsequent Vielfache von 8px. Sektionen: `padding-block: 5rem`. Cards: `padding: 1.75rem`.

### Radien & Schatten
```css
--radius-pill: 999px;   /* Buttons, Badges */
--radius-lg:   20px;    /* Cards */
--shadow-md: 0 4px 16px rgba(90,74,42,0.13);
--shadow-lg: 0 8px 32px rgba(90,74,42,0.16);
```

---

## Komponenten-Regeln

### Navbar
- Hintergrund: `var(--color-ink-dark)` (#2E2416)
- Logo: rund (`border-radius: 50%`), 44px, mit gelbem Border
- Logo-Text: `font-family: var(--font-display)`, Farbe `var(--color-primary)`
- Links: weiss, `font-weight: 700`, Hover → `var(--color-primary)`
- CTA-Link: Korall-Pill-Button

### Hero / Banner
- Hintergrund: `var(--color-primary)` (#F5B731)
- Titel: `font-family: var(--font-display)`, sehr gross (`clamp(3.8rem, 11vw, 7.5rem)`)
- Logo: 160px, rund, zentriert, mit weissem Ring-Schatten
- Unterkante: Wellen-Clip-Path in `var(--color-primary-bg)`
- CTA-Button: Sommerkorall

### Buttons
```css
/* Primär */
background: var(--color-accent);
color: white;
border-radius: var(--radius-pill);
padding: .75rem 1.75rem;
font-weight: 900;
border: 2.5px solid var(--color-accent);
transition: all 220ms ease;

/* Hover */
background: var(--color-accent-dk);
transform: translateY(-2px);
box-shadow: var(--shadow-md);
```

### Cards
- Hintergrund: `var(--color-primary-bg)` oder `white`
- Border: `1.5px solid var(--color-border)`
- Border-Radius: `var(--radius-lg)` (20px)
- Hover: `transform: translateY(-4px)` + `box-shadow: var(--shadow-lg)`

### Footer
- Hintergrund: `var(--color-ink-dark)`
- Logo: 80px, rund, dezent (opacity 0.9)
- Titel: `var(--font-display)`, Farbe `var(--color-primary)`
- Text: `rgba(255,255,255,0.5)`

---

## Logo
Das Logo (`logo.png`) erscheint an folgenden Stellen:
1. **Navbar** — 44×44px, rund, links neben dem Schriftzug
2. **Hero** — 160×160px, rund, zentriert, prominent
3. **About/Über-Sektion** — 260×260px, als visueller Anker
4. **CTA-Sektion** — 90×90px, über dem Handlungsaufruf
5. **Footer** — 80×80px, zentriert

Logo-Datei liegt unter: `./assets/logo.png` (oder bestehendem Pfad anpassen)

---

## Seiten-Struktur (falls neu aufgebaut werden muss)

```
1. <nav>          — Sticky Navbar mit Logo + Links
2. <section#hero> — Grosser Einstieg mit Logo, Titel, Datum, CTA-Buttons
3. <div.dateband> — Dunkles Datum-Banner (schwarz/gelb)
4. <div.infostrip>— 4 Info-Kacheln: Ort / Zeit / Eintritt / Stand mieten
5. <section#about>— Zweispaltig: Logo links, Text rechts
6. <section#items>— Pills-Grid aller Artikel-Kategorien
7. <section#cards>— 6 Info-Cards (Ort, Datum, Eintritt, Parking, Fisch, Food)
8. <section#cta>  — Korall-Hintergrund, Stand-Anmeldung
9. <footer>       — Logo, Adresse, Fisch-Emoji, Links
```

---

## Inhaltliche Platzhalter (anpassen!)
Ersetze folgende Werte mit den echten Daten:
- `DATUM` → tatsächliches Veranstaltungsdatum
- `ORT` → genaue Adresse / Standort
- `EMAIL` → Kontakt-E-Mail-Adresse
- `STAND_PREIS` → Preis für einen Standplatz in CHF
- `UHRZEIT_VON / BIS` → genaue Öffnungszeiten

---

## Was du NICHT ändern sollst
- Bestehende URL-Struktur und Seitennavigation beibehalten
- Alle funktionalen Formulare (Anmeldung, Kontakt) behalten
- Keine inhaltlichen Texte eigenständig erfinden — nur Struktur und Design anpassen
- SEO-relevante `<meta>`-Tags und `<title>` beibehalten

---

## Referenz
Die vollständige visuelle Referenz (alle Komponenten live) findest du in:
`design-system-schwerzenbach.html`

Öffne diese Datei im Browser um alle Komponenten, Farben und die Gesamt-Vorschau zu sehen.
