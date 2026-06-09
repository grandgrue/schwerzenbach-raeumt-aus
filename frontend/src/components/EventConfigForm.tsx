import { useState } from 'react';
import type { AdminEvent } from '../api/types';

interface Props {
  event: AdminEvent;
  busy?: boolean;
  message?: string | null;
  onSave: (body: Record<string, unknown>) => void;
}

export default function EventConfigForm({ event, busy, message, onSave }: Props) {
  const [name, setName] = useState(event.name);
  const [date, setDate] = useState(event.event_date ?? '');
  const [start, setStart] = useState(event.default_start_time ?? '');
  const [end, setEnd] = useState(event.default_end_time ?? '');
  const [open, setOpen] = useState(event.registration_open);
  const [spots, setSpots] = useState(String(event.public_spots_total));
  const [info, setInfo] = useState(event.info_text ?? '');
  const [organizers, setOrganizers] = useState(event.organizer_emails ?? '');

  const inputClass =
    'mt-1 w-full rounded-md border border-gold px-3 py-2 focus:border-accent focus:outline-none';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name,
      event_date: date || null,
      default_start_time: start || null,
      default_end_time: end || null,
      registration_open: open,
      public_spots_total: Number(spots),
      info_text: info || null,
      organizer_emails: organizers,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 card p-4">
      <h2 className="text-lg font-semibold">Event-Konfiguration</h2>
      {message && (
        <div className="rounded-md bg-brand-50 border border-brand-100 px-3 py-2 text-sm text-brand-700">
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Datum</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Beginn</label>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ende</label>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <label className="flex items-center gap-2 text-sm py-2">
          <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="rounded border-gray-300" />
          Anmeldung offen
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plätze Gemeindehaus/Schule
          </label>
          <input
            type="number"
            min={0}
            value={spots}
            onChange={(e) => setSpots(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Infotext (Startseite)</label>
        <textarea value={info} onChange={(e) => setInfo(e.target.value)} rows={4} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Organisator-E-Mail-Adressen
        </label>
        <textarea
          value={organizers}
          onChange={(e) => setOrganizers(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="eine Adresse pro Zeile"
        />
        <p className="text-xs text-gray-500 mt-1">
          Diese Adressen werden bei jeder Anmeldung, Bearbeitung oder Zurückziehung eines Stands
          benachrichtigt. Eine Adresse pro Zeile (oder mit Komma getrennt).
        </p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="rounded-pill bg-accent px-5 py-2 text-white font-medium hover:bg-accent-dark disabled:opacity-50"
      >
        {busy ? 'Wird gespeichert …' : 'Speichern'}
      </button>
    </form>
  );
}
