interface Props {
  lat: number;
  lng: number;
  label?: string;
}

/**
 * Öffnet die Karten-App des Geräts im Fussgänger-Modus mit Ziel = Koordinaten.
 * Nutzt eine Google-Maps-Directions-URL (funktioniert plattformübergreifend
 * und öffnet auf Mobilgeräten die installierte Karten-App).
 */
export function buildWalkingUrl(lat: number, lng: number): string {
  const dest = `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    dest,
  )}&travelmode=walking`;
}

export default function NavigateButton({ lat, lng, label = 'Zu Fuss hinnavigieren' }: Props) {
  return (
    <a
      href={buildWalkingUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
    >
      <span aria-hidden>🚶</span>
      {label}
    </a>
  );
}
