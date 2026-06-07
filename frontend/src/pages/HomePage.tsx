import { Link } from 'react-router-dom';
import { useEvent } from '../api/hooks';
import { Loading, ErrorNote } from '../components/StatusViews';

function formatDate(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HomePage() {
  const { data: event, isLoading, isError } = useEvent();

  return (
    <div>
      <section className="bg-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold">Schwerzenbach räumt aus</h1>
          <p className="mt-3 text-brand-50 max-w-2xl">
            Der Flohmarkt-Tag der Gemeinde: Stöbere von Haus zu Haus, finde Schätze in der
            Nachbarschaft – oder melde deinen eigenen Stand an.
          </p>

          {isLoading && <div className="mt-6 text-brand-50">Lade Event-Infos …</div>}
          {event && (
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {formatDate(event.event_date) && (
                <span className="rounded-md bg-white/15 px-3 py-2">📅 {formatDate(event.event_date)}</span>
              )}
              {event.default_start_time && event.default_end_time && (
                <span className="rounded-md bg-white/15 px-3 py-2">
                  🕘 {event.default_start_time}–{event.default_end_time} Uhr
                </span>
              )}
              <span className="rounded-md bg-white/15 px-3 py-2">
                {event.registration_open ? '✅ Anmeldung offen' : '🔒 Anmeldung geschlossen'}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/karte" className="rounded-md bg-white text-brand-700 px-5 py-2.5 font-medium hover:bg-brand-50">
              Stände auf der Karte
            </Link>
            <Link to="/liste" className="rounded-md bg-brand-700 px-5 py-2.5 font-medium hover:bg-brand-800">
              Stände als Liste
            </Link>
            {event?.registration_open && (
              <Link to="/anmelden" className="rounded-md border border-white px-5 py-2.5 font-medium hover:bg-white/10">
                Stand anmelden
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        {isError && <ErrorNote text="Die Event-Informationen konnten nicht geladen werden." />}
        {event?.info_text && (
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">{event.info_text}</div>
        )}
        {isLoading && <Loading />}
      </section>
    </div>
  );
}
