import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent, useStands } from '../api/hooks';
import MapView from '../components/MapView';
import { Loading, ErrorNote } from '../components/StatusViews';

function formatDate(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HomePage() {
  const { data: event, isLoading, isError } = useEvent();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Markttag-Modus: Anmeldung geschlossen → Such-/Entdeckungs-App.
  const marketMode = !!event && !event.registration_open;
  const { data: stands } = useStands({});

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate('/liste', { state: { q: search } });
  }

  return (
    <div>
      <section className="bg-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold">Schwerzenbach räumt aus</h1>
          <p className="mt-3 text-brand-50 max-w-2xl">
            {marketMode
              ? 'Heute ist Markttag! Stöbere von Haus zu Haus und finde Stände in deiner Nähe.'
              : 'Der Flohmarkt-Tag der Gemeinde: Stöbere von Haus zu Haus, finde Schätze in der Nachbarschaft – oder melde deinen eigenen Stand an.'}
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
              {!marketMode && (
                <span className="rounded-md bg-white/15 px-3 py-2">
                  {event.registration_open ? '✅ Anmeldung offen' : '🔒 Anmeldung geschlossen'}
                </span>
              )}
            </div>
          )}

          {marketMode ? (
            <form onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Stände durchsuchen (Titel, Beschreibung, Adresse) …"
                className="flex-1 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none"
              />
              <button type="submit" className="rounded-md bg-brand-700 px-5 py-2.5 font-medium hover:bg-brand-800">
                Suchen
              </button>
            </form>
          ) : null}

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

      {/* Markttag-Modus: eingebettete Karte aller Stände */}
      {marketMode && stands && stands.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Stände auf der Karte ({stands.length})</h2>
            <Link to="/karte" className="text-sm text-brand-600 hover:underline">Vollbild-Karte →</Link>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <MapView stands={stands} height="380px" />
          </div>
        </section>
      )}

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
