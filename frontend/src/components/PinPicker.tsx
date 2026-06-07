import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { DEFAULT_ZOOM, SCHWERZENBACH_CENTER } from '../lib/leaflet';

export interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
}

function ClickHandler({ onChange }: { onChange: (value: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function PinPicker({ value, onChange }: Props) {
  return (
    <div>
      <MapContainer
        center={value ? [value.lat, value.lng] : SCHWERZENBACH_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '320px', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            draggable
            eventHandlers={{
              dragend(e) {
                const { lat, lng } = e.target.getLatLng();
                onChange({ lat, lng });
              },
            }}
          />
        )}
      </MapContainer>
      <p className="text-xs text-gray-500 mt-1">
        {value
          ? `Standort gewählt: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} (Marker kann verschoben werden)`
          : 'Tippe auf die Karte, um den Standort deines Stands zu setzen.'}
      </p>
    </div>
  );
}
