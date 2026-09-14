# Runbook — Jahreswechsel / neue Austragung

Kurzanleitung, um die Website zwischen zwei Flohmärkten in den **Pausenmodus** zu setzen und
später für eine **neue Austragung** wieder scharf zu schalten. Die gesamte Anwendung bleibt
erhalten – es sind nur Konfiguration und (für eine neue Austragung) das Leeren der Stände nötig.

## Überblick: Lebenszyklus

```
Vorlauf (Anmeldung offen)  →  Markttag (Anmeldung geschlossen)  →  Pause (paused=1)
        ▲                                                                    │
        └──────────────  neue Austragung: DB leeren + neu konfigurieren  ◀──┘
```

Gesteuert wird alles über **/admin → Event-Konfiguration** (kein Deployment nötig):
- **Anmeldung offen** (`registration_open`): steuert Vorlauf ↔ Markttag.
- **Pausenmodus** (`paused`): blendet Karte/Liste/Anmeldung aus, zeigt Platzhalter + Rückblick.

---

## A) Nach dem Anlass → in die Pause

1. **/admin → Event-Konfiguration**
   - **Anmeldung offen**: aus (falls noch an).
   - **Pausenmodus – kein nächster Termin**: **an**. Speichern.
2. Ergebnis: Startseite = Platzhalter, `/rueckblick` sichtbar, Karte/Liste/Anmeldung aus.
3. Optional: **Rückblick aktualisieren** (siehe Abschnitt C).

> Die Stand-Daten bleiben in der Datenbank. Wer den Bearbeitungs-Link hat, könnte technisch
> weiterhin darauf zugreifen; öffentlich sind die Stände aber nicht mehr sichtbar.

---

## B) Neue Austragung vorbereiten

### B1. Datenbank sichern (immer zuerst!)
phpMyAdmin → Datenbank auswählen → **Exportieren** (Schnell, SQL). Datei sicher ablegen.

### B2. Alte Stände leeren
Kategorien, Event-Konfiguration und Admin-Login **bleiben** erhalten – nur die Stände werden
entfernt. In phpMyAdmin → Reiter **SQL**:

```sql
-- Entfernt alle Stände. Die Verknüpfungen in `stand_category` werden dank
-- ON DELETE CASCADE automatisch mitgelöscht. Kategorien & Event bleiben bestehen.
DELETE FROM `stand`;

-- Optional: Zähler zurücksetzen, damit neue Stände wieder bei ID 1 beginnen.
ALTER TABLE `stand` AUTO_INCREMENT = 1;
```

> **Nicht** leeren: `category` (Warenkategorien), `event` (Konfiguration), `admin_user` (Login).

### B3. Event neu konfigurieren (/admin → Event-Konfiguration)
- **Name** / **Datum** (neuer Event-Tag) / **Verkaufszeiten**.
- **Pausenmodus**: **aus**.
- **Anmeldung offen**: **an**, sobald die Anmeldung starten soll (sonst zunächst aus lassen).
- **Plätze Gemeindehaus** (Kapazität) prüfen.
- **Infotext** (Startseite) und **Organisator-E-Mail-Adressen** prüfen/aktualisieren.

### B4. Kategorien prüfen (/admin → Kategorien)
Bei Bedarf anpassen (anlegen/umbenennen). Bestehende Kategorien werden weiterverwendet.

### B5. Kontrolle
Startseite, Karte, Liste, Anmeldeformular kurz durchklicken. Eine Test-Anmeldung durchführen
und wieder zurückziehen (E-Mail-Versand prüfen, falls konfiguriert).

---

## C) Rückblick pflegen (optional)

Die Rückblick-Seite (`/rueckblick`) ist fest im Frontend hinterlegt:
- **Fotos:** `frontend/public/rueckblick/rueckblick-1.jpg … -5.jpg`
- **Texte/Zitate/Bildunterschriften:** `frontend/src/pages/RueckblickPage.tsx`
- **Content-Notizen:** `design-idee/rueckblick-content.md`

Zum Aktualisieren die Fotos ersetzen und/oder die Texte in `RueckblickPage.tsx` anpassen,
danach Frontend neu bauen und hochladen (Änderungen am Inhalt brauchen ein kleines Deployment).

---

## E) Link-Vorschau & SEO-Metadaten

Die Metadaten für **Link-Vorschauen** (WhatsApp, Signal, Telegram …) und Suchmaschinen stehen
**statisch** in `frontend/index.html` (`<title>`, `description`, Open Graph, Twitter-Card,
JSON-LD, `<noscript>`). Sie werden **nicht** aus der Datenbank erzeugt.

- Sie sind bewusst **datumsneutral (evergreen)** gehalten – kein fixes Datum, kein Event-Schema
  mit vergangenem Datum. Dadurch passt die Vorschau in jeder Phase (Vorlauf/Markttag/Pause).
- **Optional für eine neue Austragung:** Wer das konkrete Datum in der Link-Vorschau möchte,
  ergänzt es in `frontend/index.html` (dann aber nach dem Anlass wieder entfernen) – Frontend
  neu bauen und hochladen.
- **Wichtig – Social-Cache:** Messenger/Facebook cachen Vorschauen tage- bis wochenlang. Nach
  einer Änderung die Vorschau neu einlesen lassen, z. B. über den Facebook Sharing Debugger
  (`https://developers.facebook.com/tools/debug/` → „Scrape Again").

## D) Deployment-Erinnerung
Nur nötig, wenn **Code** geändert wurde (Konfig-Änderungen im Admin brauchen **kein** Deployment):
- Frontend `dist/` (inkl. `rueckblick/`-Fotos) → `public_html/`.
- Geänderte Backend-Dateien → `public_html/api/`.
- Neue DB-Migrationen aus `backend/sql/migrations/` in phpMyAdmin einspielen.

Details siehe `deploy/README-deploy.md`.
