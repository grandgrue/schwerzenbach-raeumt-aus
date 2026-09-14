import { Link } from 'react-router-dom';

/** Pull-Quote als aufgelockerter Akzent zwischen den Abschnitten. */
function Quote({ text, author }: { text: string; author?: string }) {
  return (
    <figure className="max-w-3xl mx-auto text-center my-10">
      <blockquote className="font-display text-3xl sm:text-4xl leading-tight text-ink-dark">
        <span className="text-accent">«</span>
        {text}
        <span className="text-accent">»</span>
      </blockquote>
      {author && (
        <figcaption className="mt-3 text-sm font-bold uppercase tracking-wide text-ink-light">
          {author}
        </figcaption>
      )}
    </figure>
  );
}

function Photo({ src, alt, caption, className = '' }: { src: string; alt: string; caption: string; className?: string }) {
  return (
    <figure className={`card overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
      <figcaption className="p-3 text-sm text-ink-light">{caption}</figcaption>
    </figure>
  );
}

export default function RueckblickPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-primary">
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-20 text-center">
          <p className="eyebrow !text-white">Rückblick</p>
          <h1
            className="mt-2 font-display text-ink-dark leading-[0.95]"
            style={{ fontSize: 'clamp(2.6rem, 8vw, 5rem)' }}
          >
            Die Premiere
          </h1>
          <p className="mt-4 text-ink-dark/80 font-bold text-lg">
            Samstag, 5. September 2026 · Schwerzenbach
          </p>
        </div>
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

      {/* EINLEITUNG */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-2">
        <p className="text-lg text-ink leading-relaxed">
          Am Samstag, 5. September 2026, war ganz Schwerzenbach mit Flohmarktständen übersät.
          Bei der Premiere von «Schwerzenbach räumt aus» – im Rahmen des «Openair Dorfgeflüster» –
          luden über 80 Stände in Gärten, Garagen und beim Gemeindehaus zum Stöbern ein.
          Organisiert von <strong>GRÜNE Schwerzenbach-Volketswil</strong> und
          <strong> GLP Volketswil-Schwerzenbach</strong>, unterstützt von der Gemeinde.
        </p>
      </section>

      {/* GROSSES FOTO (quer) */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <Photo
          src="/rueckblick/rueckblick-1.jpg"
          alt="Garagenstand mit Kinderkleidern, Büchern und Spielsachen auf einer Decke"
          caption="In Garagen und Vorgärten wurde ausgeräumt – vieles für kleines Geld."
        />
      </section>

      <Quote text="So lange habe ich mit unserer Nachbarin wohl noch nie geredet." author="Ein Standbetreiber" />

      {/* HERZSTÜCK + zwei Hochformat-Fotos */}
      <section className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <p className="eyebrow">Das Herzstück</p>
          <h2 className="text-3xl sm:text-4xl mt-1">Die Nachbarschaft kam ins Gespräch</h2>
          <p className="mt-4 text-ink leading-relaxed">
            Das Schönste an diesem Tag: Man besuchte sich gegenseitig, trank einen Kaffee und
            entdeckte, was hinter der Hecke des Nachbarn steht. Ganz im Sinne von
            «Wiederverwenden statt Wegwerfen» bekamen Bücher, Kinderkleider, Spielsachen – und
            sogar ein riesiges Kuscheleinhorn – ein zweites Leben.
          </p>
        </div>
        <Photo
          src="/rueckblick/rueckblick-2.jpg"
          alt="Strassenstand mit Büchern, Deko und Kerzen"
          caption="Liebevoll dekorierte Stände luden entlang der Strasse zum Stöbern ein."
          className="max-w-sm mx-auto"
        />
      </section>

      <Quote
        text="Wenn Menschen zueinander gefunden haben, haben wir etwas Gutes geschafft."
        author="Kiki Jungfer, Initiatorin"
      />

      {/* FOTO-GALERIE (restliche Hochformate) */}
      <section className="max-w-5xl mx-auto px-4 py-6 grid sm:grid-cols-3 gap-6">
        <Photo
          src="/rueckblick/rueckblick-3.jpg"
          alt="Besucherinnen und Besucher stöbern an einem Stand"
          caption="Stöbern und Schwatzen: Man zog von Stand zu Stand."
        />
        <Photo
          src="/rueckblick/rueckblick-4.jpg"
          alt="Pavillon mit Kleiderständern und einer Kiste Jeans"
          caption="Ganze Kleiderständer, sortiert nach Grössen – direkt vom Estrich in neue Hände."
        />
        <Photo
          src="/rueckblick/rueckblick-5.jpg"
          alt="Pinker Pavillon mit Baby- und Kinderartikeln"
          caption="Vom Hochstuhl bis zum Kinderwagen – der Nachwuchs-Bedarf fand neue Familien."
        />
      </section>

      <Quote text="Eine mega coole Idee." author="Ein Teilnehmer" />

      {/* AUSBLICK */}
      <section className="bg-accent text-white mt-6">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <img src="/logo.png" alt="" aria-hidden className="mx-auto h-20 w-20 rounded-full ring-2 ring-white/80 mb-4" />
          <h2 className="text-4xl">Und 2027?</h2>
          <p className="mt-3 text-white/90">
            Ob es eine Wiederholung gibt, ist noch offen – ausgeschlossen ist sie nach dieser
            gelungenen Premiere aber nicht. Bis dahin macht diese Website eine Pause.
          </p>
          <div className="mt-6">
            <Link to="/" className="btn-white">← Zur Startseite</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
