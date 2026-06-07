import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { PublicStand } from '../api/types';
import { DEFAULT_ZOOM, SCHWERZENBACH_CENTER } from '../lib/leaflet';
import { OfferBadges } from './CategoryBadges';

interface Props {
  stands: PublicStand[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function MapView({
  stands,
  center = SCHWERZENBACH_CENTER,
  zoom = DEFAULT_ZOOM,
  height = '70vh',
}: Props) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stands.map((stand) => (
        <Marker key={stand.id} position={[stand.lat, stand.lng]}>
          <Popup>
            <div className="space-y-1">
              <strong>{stand.title}</strong>
              <div className="text-gray-600">{stand.address}</div>
              <OfferBadges food={stand.offers_food} drinks={stand.offers_drinks} />
              <Link to={`/stand/${stand.id}`} className="text-brand-600 underline">
                Details &amp; Navigation
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
