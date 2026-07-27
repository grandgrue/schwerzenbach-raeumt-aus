import { Link } from 'react-router-dom';
import type { Category, PublicStand } from '../api/types';

interface Props {
  categories: Category[];
  stands: PublicStand[];
}

/**
 * Zeigt pro Kategorie die Anzahl Angebote als klickbaren Balken.
 * Klick springt in die nach dieser Kategorie gefilterte Liste.
 * Ohne freigegebene Stände: Fallback auf klickbare Pills (ohne Zahlen).
 */
export default function CategoryOverview({ categories, stands }: Props) {
  if (categories.length === 0) return null;

  const counts = new Map<number, number>();
  for (const s of stands) {
    for (const c of s.categories) {
      counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    }
  }

  const withCounts = categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
  const total = withCounts.reduce((sum, c) => sum + c.count, 0);

  // Noch keine freigegebenen Stände → einfache klickbare Pills.
  if (total === 0) {
    return (
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/liste"
            state={{ category: c.id }}
            className="pill hover:bg-primary transition"
          >
            {c.name}
          </Link>
        ))}
      </div>
    );
  }

  const max = Math.max(1, ...withCounts.map((c) => c.count));
  const sorted = [...withCounts].sort((a, b) => b.count - a.count);

  return (
    <div className="mt-6 grid sm:grid-cols-2 gap-2 text-left">
      {sorted.map((c) => (
        <Link
          key={c.id}
          to="/liste"
          state={{ category: c.id }}
          className="group block"
          title={`${c.count} ${c.count === 1 ? 'Angebot' : 'Angebote'} in ${c.name}`}
        >
          <div className="relative flex items-center h-10 rounded-pill bg-primary-light/40 overflow-hidden px-4 transition group-hover:shadow-md">
            <div
              className="absolute inset-y-0 left-0 bg-primary/70 transition-all group-hover:bg-primary"
              style={{ width: c.count === 0 ? '0%' : `${Math.max(8, (c.count / max) * 100)}%` }}
              aria-hidden
            />
            <span
              className={`relative z-10 font-bold text-sm truncate ${
                c.count === 0 ? 'text-ink-light' : 'text-ink-dark'
              }`}
            >
              {c.name}
            </span>
            <span className="relative z-10 ml-auto pl-2 font-black text-ink-dark text-sm tabular-nums">
              {c.count}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
