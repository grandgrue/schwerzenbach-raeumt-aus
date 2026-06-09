import { Link } from 'react-router-dom';

interface QA {
  q: string;
  a: string;
}

const faqs: QA[] = [
  {
    q: 'Was ist «Schwerzenbach räumt aus»?',
    a: 'Ein gemeindeweiter Flohmarkt-Tag: Einwohner:innen verkaufen Gebrauchtes vor dem Haus, in der Garage oder auf dem Vorplatz. Besucher:innen finden alle Stände auf einer Karte und in einer Liste.',
  },
  {
    q: 'Wie melde ich einen Stand an?',
    a: 'Über die Seite «Stand anmelden». Du setzt den Standort per Klick auf die Karte, gibst Titel, Beschreibung und Kontaktangaben an und sendest das Formular ab. Anschliessend prüft das Organisationskomitee deinen Eintrag.',
  },
  {
    q: 'Brauche ich ein Benutzerkonto?',
    a: 'Nein. Nach der Anmeldung erhältst du per E-Mail einen persönlichen Bearbeitungs-Link, mit dem du deinen Stand jederzeit ändern oder zurückziehen kannst. Bewahre diesen Link sicher auf.',
  },
  {
    q: 'Ich habe keinen Platz zuhause – wo kann ich verkaufen?',
    a: 'Wer zuhause keinen Stand aufstellen kann, bucht im Anmeldeformular einen Platz auf dem Parkplatz des Gemeindehauses oder der Primarschule. Die Anzahl ist begrenzt; die Plätze werden nach Anmelde-Eingang vergeben. Ist alles vergeben, wird die Option als «ausgebucht» angezeigt.',
  },
  {
    q: 'Wer darf mitmachen?',
    a: 'Alle privaten Haushalte in Schwerzenbach. Gewerbliche Verkäufer:innen sowie Neu- und Handelsware sind nicht zugelassen – es geht um Gebrauchtes aus dem eigenen Haushalt.',
  },
  {
    q: 'Wo darf ich meinen Stand aufstellen?',
    a: 'Nur auf eigenem Privatgrund (Garage, Hof, Garten, Vorplatz) – nicht auf dem Gehweg oder anderen öffentlichen Flächen. Mieter:innen holen bitte vorab die Zustimmung der Eigentümerschaft bzw. Verwaltung ein. Tipp: Kennzeichne deinen Stand gut sichtbar, z. B. mit Luftballons.',
  },
  {
    q: 'Darf ich Essen und Getränke verkaufen?',
    a: 'Essen und Getränke dürfen nur auf Spendenbasis angeboten werden – ein Verkauf ist nicht gestattet. Im Anmeldeformular kannst du ankreuzen, dass du Essen und/oder Getränke anbietest; das wird bei deinem Stand vermerkt.',
  },
  {
    q: 'Wer haftet? Worauf muss ich achten?',
    a: 'Die Teilnahme erfolgt auf eigene Verantwortung. Jede:r sorgt selbst für die Sicherheit auf dem eigenen Grundstück (Verkehrssicherungspflicht). Die Gemeinde und das Organisationskomitee übernehmen keine Haftung für Schäden oder Verluste.',
  },
  {
    q: 'Was passiert mit meinen Daten? (Datenschutz)',
    a: 'Deine Angaben werden ausschliesslich für diesen Anlass gespeichert. E-Mail-Adresse und Mobilnummer werden nicht veröffentlicht – die E-Mail dient nur deinem Bearbeitungs-Link, die Mobilnummer nur der Kontaktaufnahme durch das Organisationskomitee. Du entscheidest selbst, ob und welche Kontaktangaben (Name/Telefon) öffentlich sichtbar sind. Die Standort-Adresse ist öffentlich, da sie den Zweck des Anlasses bildet.',
  },
  {
    q: 'Wie finde ich zu einem Stand?',
    a: 'Auf der Detailseite jedes Stands gibt es einen Button «Zu Fuss hinnavigieren». Dieser öffnet die Karten-App deines Geräts im Fussgänger-Modus mit dem Ziel-Standort.',
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Häufige Fragen &amp; Datenschutz</h1>
      <div className="space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="card p-4">
            <summary className="font-medium cursor-pointer text-ink-dark">{item.q}</summary>
            <p className="mt-2 text-ink whitespace-pre-line">{item.a}</p>
          </details>
        ))}

        <details className="card p-4">
          <summary className="font-medium cursor-pointer text-ink-dark">
            Ich habe meinen Bearbeitungs-Link verloren
          </summary>
          <p className="mt-2 text-ink">
            Kein Problem: Gib auf der Seite{' '}
            <Link to="/link-anfordern" className="text-brand-600 hover:underline">
              Bearbeitungs-Link anfordern
            </Link>{' '}
            die E-Mail-Adresse ein, mit der du dich angemeldet hast. Du erhältst einen neuen Link
            für alle deine Einträge (frühere Links werden dabei ungültig).
          </p>
        </details>
      </div>

      <div className="card p-5 text-center mt-2">
        <h2 className="text-xl">Noch Fragen?</h2>
        <p className="text-ink mt-2 text-sm">
          Schreib uns – wir helfen gerne weiter:
        </p>
        <a
          href="mailto:info@schwerzenbach-raeumt-aus.ch"
          className="inline-block mt-2 font-bold text-accent hover:text-accent-dark"
        >
          info@schwerzenbach-raeumt-aus.ch
        </a>
      </div>
    </div>
  );
}
