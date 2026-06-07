export interface GeocodeResult {
  lat: number;
  lng: number;
}

/**
 * Geocodiert eine Strassenadresse innerhalb von Schwerzenbach über Nominatim
 * (OpenStreetMap). Der Ort „8603 Schwerzenbach, Schweiz" wird automatisch ergänzt.
 * Gibt null zurück, wenn kein Treffer gefunden wurde.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = `${address}, 8603 Schwerzenbach, Schweiz`;
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ch&q=' +
    encodeURIComponent(query);

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Geocoding fehlgeschlagen');
  }
  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
