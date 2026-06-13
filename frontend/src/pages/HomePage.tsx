import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategories, useEvent, useStands } from '../api/hooks';
import MapView from '../components/MapView';
import { Loading } from '../components/StatusViews';

function formatDate(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HomePage() {
  const { data: event, isLoading } = useEvent();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const marketMode = !!event && !event.registration_open;
  const { data: stands } = useStands({});

  const dateLabel = formatDate(event?.event_date ?? null);
  const timeLabel =
    event?.default_start_time && event?.default_end_time
      ? `${event.default_start_time}–${event.default_end_time} Uhr`
      : null;
  const subtitleParts = [dateLabel, timeLabel].filter(Boolean);

  const wannText =
    subtitleParts.length > 0
      ? `${subtitleParts.join(' · ')}. Bei jedem Wetter — ausser Gewitter.`
      : '5. September 2026. Bei jedem Wetter — ausser Gewitter.';

  const infoCards = [
    { icon: '📍', title: 'Wo findet es statt?', text: 'Verteilt im ganzen Dorf — vor den Häusern der Anbieter:innen sowie beim Gemeindehaus / an der Schule. Alle Stände findest du auf der Karte.' },
    { icon: '🗓', title: 'Wann?', text: wannText },
    { icon: '🎫', title: 'Was kostet es?', text: 'Besuch und Teilnahme sind kostenlos. Du brauchst kein Konto, um einen Stand anzumelden.' },
    { icon: '🚲', title: 'Anreise & Navigation', text: 'Am besten zu Fuss oder mit dem Velo. Auf jeder Stand-Detailseite gibt es einen «Zu Fuss hinnavigieren»-Button.' },
    { icon: '🍰', title: 'Verpflegung', text: 'An einzelnen Ständen gibt es Kaffee, Kuchen und Snacks auf Spendenbasis. Diese sind speziell gekennzeichnet.' },
    { icon: '♻️', title: 'Gut für die Umwelt', text: 'Wiederverwenden statt wegwerfen: Jeder verkaufte Gegenstand bekommt ein zweites Leben, spart Ressourcen und reduziert Abfall. Ein Flohmarkt ist gelebte Kreislaufwirtschaft — gut für die Umwelt, das Portemonnaie und die Nachbarschaft.' },
  ];

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate('/liste', { state: { q: search } });
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-primary">
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-24 text-center">
          <img
            src="/logo.png"
            alt="Logo Schwerzenbach räumt aus"
            className="mx-auto h-32 w-32 sm:h-40 sm:w-40 rounded-full ring-4 ring-white shadow-lg"
          />
          <p className="eyebrow !text-white mt-6">Der Quartier-Flohmarkt · Schwerzenbach</p>
          <h1
            className="mt-2 font-display text-ink-dark leading-[0.95]"
            style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
          >
            Schwerzenbach<br />räumt aus
          </h1>
          {subtitleParts.length > 0 && (
            <p className="mt-4 text-ink-dark/80 font-bold text-lg">{subtitleParts.join(' · ')}</p>
          )}

          {marketMode ? (
            <form onSubmit={submitSearch} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Stände durchsuchen …"
                className="flex-1 rounded-pill px-5 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button type="submit" className="btn-primary">Suchen</button>
            </form>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            {marketMode ? (
              <>
                <Link to="/karte" className="btn-primary">🗺️ Zur Karte</Link>
                <Link to="/liste" className="btn-ghost">Zur Liste</Link>
              </>
            ) : (
              <>
                <Link to="/anmelden" className="btn-primary">🏷️ Stand anmelden</Link>
                <Link to="/karte" className="btn-ghost">Stände entdecken</Link>
              </>
            )}
          </div>
        </div>

        {/* Wellen-Abschluss in die Seitenfarbe */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          style={{ height: '56px' }}
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="#FFF8DC" d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* DATUMS-BAND */}
      {(dateLabel || timeLabel) && (
        <div className="bg-ink-dark text-white text-center px-4 py-5">
          <div className="font-display text-primary text-2xl sm:text-3xl tracking-wide">
            {dateLabel ?? 'Datum folgt'}
          </div>
          <div className="text-white/70 text-sm mt-1">
            {[timeLabel, 'Teilnahme kostenlos', 'Schwerzenbach'].filter(Boolean).join('  ·  ')}
          </div>
        </div>
      )}

      {/* INFO-STRIP */}
      <div className="max-w-5xl mx-auto px-4 mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: '📍', label: 'Ort', value: 'Haustür & Gemeindehaus' },
          { icon: '🕘', label: 'Öffnungszeiten', value: timeLabel ?? 'folgt' },
          { icon: '🎫', label: 'Teilnahme', value: 'Kostenlos' },
          { icon: '📦', label: 'Mitmachen', value: 'Stand online anmelden' },
        ].map((t) => (
          <div key={t.label} className="card p-4 flex items-center gap-3">
            <div className="text-2xl" aria-hidden>{t.icon}</div>
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-light font-bold">{t.label}</div>
              <div className="font-bold text-ink-dark text-sm">{t.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MARKTTAG: eingebettete Karte */}
      {marketMode && stands && stands.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Stände auf der Karte</h2>
            <Link to="/karte" className="text-accent font-bold hover:text-accent-dark">Vollbild →</Link>
          </div>
          <div className="card overflow-hidden">
            <MapView stands={stands} height="380px" />
          </div>
        </section>
      )}

      {/* ÜBER */}
      <section className="max-w-5xl mx-auto px-4 py-14 grid md:grid-cols-[260px_1fr] gap-8 items-center">
        <img
          src="/logo.png"
          alt=""
          aria-hidden
          className="mx-auto h-48 w-48 md:h-64 md:w-64 rounded-full ring-4 ring-gold/60"
        />
        <div>
          <p className="eyebrow">Was ist das?</p>
          <h2 className="text-3xl sm:text-4xl mt-1">Der grosse Quartier-Flohmarkt</h2>
          <p className="mt-4 text-ink leading-relaxed">
            Schwerzenbach räumt aus — zum ersten Mal! Ob du es Flohmarkt, Flohmi oder
            Trödelmarkt nennst: Bei dieser Premiere verkaufen Einwohner:innen vor der eigenen
            Haustür, in der Garage oder auf dem Vorplatz, was sie nicht mehr brauchen — und finden
            beim Stöbern und Trödeln durchs Dorf vielleicht genau das, wonach sie gesucht haben.
            Ob es eine Wiederholung gibt, wird sich zeigen: umso schöner, beim Auftakt dabei zu sein.
          </p>
          <p className="mt-3 text-ink leading-relaxed">
            Ob Möbel, Kleider, Bücher oder Spielzeug: Hier bekommt alles eine zweite Chance.
            Wer keinen Platz vor dem Haus hat, kann einen Stand beim Gemeindehaus reservieren.
          </p>
          <span className="pill mt-4">♻️ Wiederverwenden statt wegwerfen</span>
        </div>
      </section>

      {/* ZWEI OPTIONEN */}
      <section className="max-w-5xl mx-auto px-4 pb-4 grid sm:grid-cols-2 gap-4">
        <div className="card card-hover p-6">
          <div className="text-3xl" aria-hidden>🏡</div>
          <h3 className="text-2xl mt-2">Bei mir zuhause</h3>
          <p className="text-ink mt-2 text-sm leading-relaxed">
            Mitmachen ist kinderleicht: kurzes Formular ausfüllen, Adresse angeben — fertig. Kein
            Konto nötig, die Teilnahme ist kostenlos. Verkauft wird direkt vor der Garage, auf dem
            Vorplatz oder im Vorgarten.
          </p>
        </div>
        <div className="card card-hover p-6">
          <div className="text-3xl" aria-hidden>🏛️</div>
          <h3 className="text-2xl mt-2">Beim Gemeindehaus / an der Schule</h3>
          <p className="text-ink mt-2 text-sm leading-relaxed">
            Kein Platz zuhause? Reserviere einen der begrenzten Stände beim Gemeindehaus.
            Die Plätze werden nach Anmelde-Eingang vergeben.
          </p>
        </div>
      </section>

      {/* KATEGORIEN-PILLS */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="eyebrow">Was dich erwartet</p>
          <h2 className="text-3xl sm:text-4xl mt-1">Tausend Schätze warten</h2>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {categories.map((c) => (
              <span key={c.id} className="pill">{c.name}</span>
            ))}
          </div>
        </section>
      )}

      {/* INFO-CARDS (FAQ-Teaser) */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-3xl text-center mb-8">Alles zur Veranstaltung</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {infoCards.map((c) => (
            <div key={c.title} className="card card-hover p-6">
              <div className="text-3xl" aria-hidden>{c.icon}</div>
              <h3 className="text-xl mt-2">{c.title}</h3>
              <p className="text-ink text-sm mt-2 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/faq" className="text-accent font-bold hover:text-accent-dark">
            Alle Fragen &amp; Datenschutz →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <img src="/logo.png" alt="" aria-hidden className="mx-auto h-20 w-20 rounded-full ring-2 ring-white/80 mb-4" />
          {marketMode ? (
            <>
              <h2 className="text-4xl">Heute ist Markttag!</h2>
              <p className="mt-3 text-white/90">Finde Stände in deiner Nähe — auf der Karte oder in der Liste.</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link to="/karte" className="btn-white">🗺️ Zur Karte</Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow !text-white">Mitmachen</p>
              <h2 className="text-4xl mt-1">Stand anmelden &amp; ausräumen</h2>
              <p className="mt-3 text-white/90">
                Melde deinen Verkaufsstand online an — kostenlos und ohne Benutzerkonto.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link to="/anmelden" className="btn-white">📝 Stand anmelden</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* INFO-TEXT DES OK */}
      {event?.info_text && (
        <section className="max-w-3xl mx-auto px-4 py-12">
          <div className="prose max-w-none text-ink whitespace-pre-line">{event.info_text}</div>
        </section>
      )}

      {isLoading && <div className="py-12"><Loading /></div>}
    </div>
  );
}
