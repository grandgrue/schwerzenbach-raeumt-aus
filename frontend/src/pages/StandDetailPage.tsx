import { Link, useLocation, useParams } from 'react-router-dom';
import { useStand } from '../api/hooks';
import CategoryBadges, { OfferBadges } from '../components/CategoryBadges';
import MapView from '../components/MapView';
import NavigateButton from '../components/NavigateButton';
import { ErrorNote, Loading } from '../components/StatusViews';

export default function StandDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const standId = Number(id);
  const { data: stand, isLoading, isError } = useStand(standId);

  // Herkunft bestimmt das Ziel des Zurück-Knopfs (Karte vs. Liste).
  const from = (location.state as { from?: string } | null)?.from;
  const back = from === '/karte' ? { to: '/karte', label: '← Zurück zur Karte' } : { to: '/liste', label: '← Zurück zur Liste' };

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-6"><Loading /></div>;
  if (isError || !stand)
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <ErrorNote text="Dieser Stand wurde nicht gefunden." />
        <Link to={back.to} className="text-brand-600 hover:underline">{back.label}</Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      <Link to={back.to} className="text-sm text-brand-600 hover:underline">{back.label}</Link>

      <div>
        <h1 className="text-2xl font-bold">{stand.title}</h1>
        <p className="text-gray-600 mt-1">{stand.address}</p>
        {stand.start_time && stand.end_time && (
          <p className="text-gray-600">Verkauf: {stand.start_time}–{stand.end_time} Uhr</p>
        )}
      </div>

      <div className="space-y-2">
        <CategoryBadges categories={stand.categories} />
        <OfferBadges food={stand.offers_food} drinks={stand.offers_drinks} />
      </div>

      {stand.description && <p className="text-gray-800 whitespace-pre-line">{stand.description}</p>}

      {stand.contact && (stand.contact.name || stand.contact.phone) && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm">
          <span className="font-medium">Kontakt: </span>
          {stand.contact.name}
          {stand.contact.name && stand.contact.phone ? ' · ' : ''}
          {stand.contact.phone}
        </div>
      )}

      <div>
        <NavigateButton lat={stand.lat} lng={stand.lng} />
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <MapView stands={[stand]} center={[stand.lat, stand.lng]} zoom={16} height="320px" />
      </div>
    </div>
  );
}
