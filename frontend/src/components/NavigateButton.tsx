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
      className="btn-primary text-sm"
    >
      <span aria-hidden>🚶</span>
      {label}
    </a>
  );
}
