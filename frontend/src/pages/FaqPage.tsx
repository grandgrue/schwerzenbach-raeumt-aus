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
          <details key={item.q} className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="font-medium cursor-pointer text-gray-900">{item.q}</summary>
            <p className="mt-2 text-gray-700 whitespace-pre-line">{item.a}</p>
          </details>
        ))}

        <details className="rounded-lg border border-gray-200 bg-white p-4">
          <summary className="font-medium cursor-pointer text-gray-900">
            Ich habe meinen Bearbeitungs-Link verloren
          </summary>
          <p className="mt-2 text-gray-700">
            Kein Problem: Gib auf der Seite{' '}
            <Link to="/link-anfordern" className="text-brand-600 hover:underline">
              Bearbeitungs-Link anfordern
            </Link>{' '}
            die E-Mail-Adresse ein, mit der du dich angemeldet hast. Du erhältst einen neuen Link
            für alle deine Einträge (frühere Links werden dabei ungültig).
          </p>
        </details>
      </div>
    </div>
  );
}
