import { Link } from 'react-router-dom';
import type { PublicStand } from '../api/types';
import CategoryBadges, { OfferBadges } from './CategoryBadges';

function timeRange(stand: PublicStand): string | null {
  if (stand.start_time && stand.end_time) return `${stand.start_time}–${stand.end_time} Uhr`;
  return null;
}

export default function StandCard({ stand }: { stand: PublicStand }) {
  const time = timeRange(stand);
  return (
    <Link
      to={`/stand/${stand.id}`}
      state={{ from: '/liste' }}
      className="card card-hover block p-4"
    >
      <h3 className="text-xl text-ink-dark">{stand.title}</h3>
      <p className="text-sm text-ink-light mt-0.5">{stand.address}</p>
      {time && <p className="text-sm text-ink-light">{time}</p>}
      {stand.description && (
        <p className="text-sm text-ink mt-2 line-clamp-2">{stand.description}</p>
      )}
      <div className="mt-3 space-y-1">
        <CategoryBadges categories={stand.categories} />
        <OfferBadges food={stand.offers_food} drinks={stand.offers_drinks} />
      </div>
    </Link>
  );
}
