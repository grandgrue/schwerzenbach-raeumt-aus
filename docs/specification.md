# Spezifikation — „Schwerzenbach räumt aus"

> **Das WAS.** Dieses Dokument beschreibt die fachlichen Anforderungen der Webanwendung.
> Es ist die verbindliche Grundlage für die Implementierung. Technische Umsetzung siehe
> [`technical-plan.md`](technical-plan.md), Aufgaben-/Umsetzungsreihenfolge siehe
> [`tasks.md`](tasks.md).

## 1. Ziel & Vision

Eine schlanke, kostengünstig hostbare Webanwendung, mit der die Gemeinde Schwerzenbach (ZH)
ihren jährlichen Flohmarkt-Tag organisiert: Einwohner:innen melden niederschwellig (ohne
Benutzerkonto) einen Verkaufsstand an (zuhause, Garage, Vorplatz oder beim Gemeindehaus),
das Organisationskomitee gibt ihn frei, und Besucher:innen entdecken alle Stände über eine
**Karte** und eine **Liste** mit Filter und Suche.

- **Domain:** `schwerzenbach-raeumt-aus.ch` (bereits registriert)
- **Sprache:** ausschliesslich Deutsch (Hochdeutsch)
- **Wiederverwendbarkeit:** Die App wird jährlich für den jeweils nächsten Event
  wiederverwendet (Event-Datum ist konfigurierbar).

## 2. Umfang (Scope)

### In Scope (MVP)
- Öffentliche Karten- und Listenansicht aller freigegebenen Stände
- Filter (Kategorie, Essen/Getränke) und Freitextsuche
- Stand-Detailseite mit Fuss-Navigations-Button (öffnet Karten-App des Geräts)
- Kontolose Stand-Anmeldung per Formular + geheimer Bearbeitungs-Link via E-Mail
- Bearbeiten / Zurückziehen eines Stands über den Bearbeitungs-Link
- Admin-Bereich: Moderation und Bearbeitung der Stände, Verwaltung der Kategorien +
  Konfiguration des Events
- FAQ-Seite inkl. Datenschutz-Transparenz

### Out of Scope (MVP)
- Foto-Uploads
- In-App-Routenberechnung (Fuss-Navigation wird an die Geräte-Karten-App delegiert)
- Bezahlung, Reservation, Chat
- Mehrere parallele Events
- Mehrsprachigkeit
- Anbieter-Benutzerkonten / Passwörter
- Native Mobile-App

## 3. Nutzerrollen

| Rolle | Authentifizierung | Kann … |
|------|-------------------|--------|
| **Besucher:in** | keine (anonym) | Stände auf Karte/Liste ansehen, filtern, suchen, Details öffnen, zu Fuss hinnavigieren |
| **Anbieter:in** | kontolos, geheimer Edit-Link | Stand anmelden, später bearbeiten oder zurückziehen |
| **Admin / OK** | Login (Benutzer + Passwort) | Stände moderieren (freigeben/ablehnen/bearbeiten/löschen), Kategorien verwalten, Event konfigurieren |

## 4. User Stories & Akzeptanzkriterien

### Besucher:in
- **B1 — Karte:** Als Besucher:in sehe ich alle **freigegebenen** Stände als Pins auf einer
  Karte. Ein Klick auf einen Pin zeigt eine Kurzinfo (Titel, Adresse, **Beschreibung,
  Kategorien**, Essen/Getränke) mit Link zur Detailseite. Über diesen Link gelangt der
  **Zurück-Knopf** auf der Detailseite wieder zur **Karte** (von der Liste entsprechend zur
  Liste).
- **B2 — Liste & Filter:** Ich sehe die Stände in einer Liste und kann nach **Kategorie**,
  nach **Essen** bzw. **Getränke** und per **Freitext** filtern sowie nach Name sortieren.
- **B3 — Detailseite:** Ich öffne eine Stand-Detailseite mit Titel, Beschreibung, Adresse,
  Kategorien, Verkaufszeiten, Essen/Getränke-Hinweis und — falls von der/dem Anbieter:in
  freigegeben — öffentlichem Kontakt.
- **B4 — Event-Info:** Auf der Startseite sehe ich Event-Datum, Verkaufszeitfenster und
  einen Infotext des OK.
- **B5 — Fuss-Navigation:** Auf der Detailseite nutze ich einen Button
  **„Zu Fuss hinnavigieren"**, der die Karten-App meines Geräts im Fussgänger-Modus mit den
  Koordinaten des Stands öffnet.
- **B6 — FAQ:** Ich rufe eine FAQ-Seite mit häufigen Fragen und Datenschutz-Informationen auf.
- **B7 — Markttag-Startseite:** Sobald die Anmeldung **geschlossen** ist, wird die Startseite
  zur Such-/Entdeckungs-App: such-orientierter Hero-Text, ein **Suchfeld** (springt vorbefüllt
  in die Liste), eine **eingebettete Karte** aller Stände und prominente Buttons zu Karte/Liste;
  „Stand anmelden" entfällt. Bei offener Anmeldung bleibt die werbende Vorlauf-Ansicht.

### Anbieter:in
- **A1 — Anmelden:** Ich melde über ein Formular einen Stand an mit:
  - **Standort-Auswahl** *(Pflicht)* — entweder **„bei mir zuhause"** oder
    **„beim Gemeindehaus / an der Schule"** (siehe A1c).
  - **Titel** und **Beschreibung** *(Pflicht / optional)*
  - **Kategorien** (Mehrfachauswahl)
  - **Verkaufszeiten** von–bis *(mit den Event-Standardzeiten **vorbelegt**, überschreibbar)*
  - Flags **„bietet Essen auf Spendenbasis"** / **„bietet Getränke auf Spendenbasis"**
  - **E-Mail** *(Pflicht, privat — nur für den Bearbeitungs-Link)*
  - **Mobiltelefonnummer** *(Pflicht, privat — nur für das Organisationskomitee)*
  - **Öffentliche Kontaktangaben** (Name und/oder Telefon) — **ich entscheide selbst**, ob
    und welche davon öffentlich angezeigt werden.
- **A1b — Datenschutz-Transparenz:** Das Formular weist klar darauf hin, dass meine Angaben
  **nur für diesen Anlass** gespeichert werden, dass **E-Mail und Mobilnummer nicht
  veröffentlicht** werden und dass ich **selbst entscheide**, welche Kontaktangaben
  öffentlich sichtbar sind.
- **A1c — Standort-Auswahl (kombinierte Platz-Frage):** Das Formular stellt **eine Auswahl**
  zwischen zwei Optionen:
  - **„Bei mir zuhause"** → ich gebe die **Adresse** ein; der **Pin wird automatisch
    gesetzt** (Geocoding mit Suffix „8603 Schwerzenbach") und ist **manuell verschiebbar**.
  - **„Beim Gemeindehaus / an der Schule"** → der **Standort wird automatisch beim
    Gemeindehaus gesetzt** (keine Adresseingabe nötig). Hierfür gilt:
    - Die Anzahl Plätze ist begrenzt (`public_spots_total`, vom OK konfigurierbar).
    - Das System **zählt die Buchungen automatisch** (alle nicht abgelehnten/zurückgezogenen
      Stände mit dieser Option) und zeigt die **verbleibenden freien Plätze** an.
    - Sobald **alle Plätze vergeben** sind, ist diese Option **nicht mehr wählbar**
      („ausgebucht"); „bei mir zuhause" bleibt möglich.
    - Die Durchsetzung erfolgt **serverseitig** (verhindert Überbuchung).

  Hinweistext im Formular: *„Alle, die keine Möglichkeit haben bei sich zuhause einen Stand
  aufzustellen, können einen Platz beim Gemeindehaus oder der Primarschule buchen. Die Plätze
  werden nach Anmelde-Eingang vergeben."*
- **A2 — Bestätigung:** Nach dem Absenden hat mein Stand den Status **„in Prüfung"**. Ich
  erhalte eine **E-Mail mit einem geheimen Bearbeitungs-Link**.
- **A3 — Bearbeiten/Zurückziehen:** Über den Link kann ich meinen Stand **bearbeiten** oder
  **zurückziehen**.
- **A4 — Anmeldefenster:** Eine Anmeldung ist nur möglich, solange das OK die Anmeldung
  **offen** hat.
- **A5 — Bearbeitungs-Link erneut anfordern:** Habe ich meinen Link verloren, gebe ich auf
  einer eigenen Seite (`/link-anfordern`) meine E-Mail-Adresse ein und erhalte für **alle**
  meine (nicht zurückgezogenen) Stände einen neuen Link. *Aus Sicherheitsgründen werden dabei
  neue Tokens erzeugt; frühere Links werden ungültig.* Einstieg dezent auf Anmelden-Seite,
  in der FAQ und auf der Stand-Detailseite. Schutz: Honeypot + Captcha + Rate-Limit; die
  Antwort ist immer generisch (keine Auskunft, ob die Adresse existiert).

### Admin / Organisationskomitee
- **AD1 — Login:** Ich melde mich mit Benutzername und Passwort an.
- **AD2 — Moderation:** Ich sehe alle Stände nach Status (in Prüfung / freigegeben /
  abgelehnt / zurückgezogen) und kann einzelne Stände **freigeben, ablehnen, bearbeiten
  oder löschen**. Ich sehe die privaten Felder (E-Mail, Mobilnummer) zur Kontaktaufnahme.
- **AD3 — Event-Konfiguration:** Ich konfiguriere Name, **Datum**, **Verkaufszeitfenster**
  (Standard), **Anmeldung offen/geschlossen**, die **Anzahl verfügbarer Plätze am
  Gemeindehaus/an der Schule** (`public_spots_total`) und einen öffentlichen **Infotext**.
- **AD4 — Platz-Buchungen sehen:** Ich sehe in der Moderationsliste, welche Stände einen
  Platz am Gemeindehaus/an der Schule gebucht haben, sowie die Anzahl belegter/freier Plätze.
- **AD5 — Stände bearbeiten:** Ich kann **alle bestehenden Stände** vollständig bearbeiten
  (gleiche Felder wie das Anmeldeformular).
- **AD6 — Kategorien verwalten:** Ich kann Kategorien **anlegen, umbenennen und löschen**.
  Eine Kategorie, die bereits von mindestens einem Stand genutzt wird, **kann nicht gelöscht**
  werden (Hinweis mit Anzahl betroffener Stände).
- **AD7 — Organisator-Benachrichtigungen:** In der Event-Konfiguration hinterlege ich
  **mehrere Organisator-E-Mail-Adressen** (eine pro Zeile). Diese werden automatisch
  benachrichtigt, sobald ein Stand von Anbieter:innen **neu angemeldet, bearbeitet oder
  zurückgezogen** wird. Die Adressen sind **privat** (nie über die öffentliche API sichtbar).

## 5. Nicht-funktionale Anforderungen

- **Hosting-Kompatibilität:** Läuft auf Shared Hosting hoststar.ch (Apache + PHP 8.x +
  MySQL/MariaDB). Kein Node.js-Runtime auf dem Server. Deployment per Git/FTP.
- **Performance:** Karten- und Listenansicht laden bei einigen hundert Ständen in < 2 s.
- **Responsiv & mobil:** Besucher:innen nutzen die Karte unterwegs auf dem Smartphone.
- **Zugänglichkeit:** Tastaturbedienbar, ausreichende Farbkontraste, sinnvolle
  Alternativtexte.
- **Robustheit/Kosten:** Keine kostenpflichtigen Drittdienste; Karte über
  OpenStreetMap-Tiles, Navigation über die geräteeigene Karten-App.

## 6. Datenschutz (CH DSG)

- Es werden **minimale Personendaten** gespeichert und **nur für diesen Anlass** verwendet.
- **E-Mail und Mobilnummer sind privat** und werden **niemals öffentlich** angezeigt oder
  über die öffentliche API ausgeliefert:
  - E-Mail dient ausschliesslich dem Versand des Bearbeitungs-Links.
  - Mobilnummer dient ausschliesslich der Kontaktaufnahme durch das OK.
- **Öffentliche Kontaktangaben** (Name/Telefon) werden nur angezeigt, wenn die/der
  Anbieter:in dies ausdrücklich freigegeben hat (`show_public_contact`).
- Die **Adresse** ist öffentlich, da sie den Zweck des Events bildet (Standort finden).
- **Bearbeitungs-Link** ist eine Capability-URL mit kryptografisch zufälligem Token; in der
  Datenbank wird nur dessen **Hash** gespeichert, der Rohwert existiert nur in der E-Mail.
- **Keine Tracking-Cookies**; nur eine technisch notwendige Session-Cookie für den
  Admin-Login.
- Datenschutz-Hinweise erscheinen im **Anmeldeformular** und auf der **FAQ-Seite**.

## 7. Spam- & Missbrauchsschutz

- **Honeypot-Feld** im Anmeldeformular (für Menschen unsichtbar).
- **Einfache Rechen-/Captcha-Frage** (kein externer Dienst).
- **Serverseitige Rate-Limitierung** der Anmeldungen (pro IP/Zeitfenster).
- **Admin-Moderation** als letzte Instanz: Stände sind erst nach Freigabe öffentlich.

## 8. Festgelegte Entscheidungen / Defaults

- **Bearbeitung eines bereits freigegebenen Stands:** Der Stand bleibt sichtbar, wird aber
  für das OK als **„bearbeitet"** markiert (statt automatisch zurück in „in Prüfung").
- **Pin:** frei setzbar; Karte ist standardmässig auf das Gemeindehaus Schwerzenbach
  (≈ `47.38239, 8.65643`) zentriert. Keine harte geografische Grenze.
- **Captcha:** einfache Rechenfrage, ergänzt durch Honeypot + Rate-Limit.
- **Verkaufszeiten pro Stand:** optional; ohne Angabe gilt das Event-Standardzeitfenster.

## 8a. Teilnahmebedingungen & Kontakt (FAQ + Anmeldeseite)
Auf der Anmeldeseite (kompakt) und in der FAQ kommuniziert:
- Teilnahme nur für **private Haushalte**; **keine gewerblichen Verkäufer:innen / Neu- &
  Handelsware**.
- Verkauf nur auf **eigenem Privatgrund** (Garage/Hof/Vorplatz), **nicht** auf Gehweg/
  öffentlichen Flächen; Mieter:innen holen die **Zustimmung der Eigentümerschaft** ein.
- **Essen/Getränke nur auf Spendenbasis — Verkauf nicht gestattet** (Hinweis auch direkt
  beim Formularfeld).
- Teilnahme auf **eigene Verantwortung** (Verkehrssicherungspflicht); **keine Haftung** der
  Gemeinde/des OK. Tipp: Stand sichtbar kennzeichnen (z. B. Luftballons).
- **Öffentlicher Kontakt für Rückfragen:** `info@schwerzenbach-raeumt-aus.ch` (FAQ + Footer).

## 9. Glossar

- **Stand:** Ein angemeldeter Verkaufsstandort einer/eines Anbieter:in.
- **Event:** Der (jährliche) Flohmarkt-Tag mit Datum und Verkaufszeitfenster.
- **Bearbeitungs-Link / Edit-Token:** Geheime URL, mit der eine kontolose Anbieter:in den
  eigenen Stand bearbeiten/zurückziehen kann.
- **OK:** Organisationskomitee (= Admin-Rolle).
