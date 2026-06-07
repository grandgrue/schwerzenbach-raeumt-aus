import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Standard-Marker-Icons für Vite-Builds korrekt verdrahten.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Ungefährer Mittelpunkt von Schwerzenbach (ZH). */
export const SCHWERZENBACH_CENTER: [number, number] = [47.366, 8.643];
export const DEFAULT_ZOOM = 15;
