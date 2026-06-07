import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Standard-Marker-Icons für Vite-Builds korrekt verdrahten.
// Wichtig: _getIconUrl entfernen, sonst stellt Leaflet dem (absoluten)
// Asset-Pfad den automatisch erkannten imagePath voran → kaputte Marker.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Gemeindehaus Schwerzenbach (ZH) als Karten-Mittelpunkt. */
export const SCHWERZENBACH_CENTER: [number, number] = [47.38239, 8.65643];
export const DEFAULT_ZOOM = 15;
