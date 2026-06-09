import { Link } from 'react-router-dom';
import type { PrivateStand } from '../api/types';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-200 text-gray-600',
};

const statusLabels: Record<string, string> = {
  pending: 'in Prüfung',
  approved: 'freigegeben',
  rejected: 'abgelehnt',
  withdrawn: 'zurückgezogen',
};

interface Props {
  stands: PrivateStand[];
  busyId: number | null;
  onSetStatus: (id: number, status: string) => void;
  onEdit: (stand: PrivateStand) => void;
  onDelete: (id: number) => void;
}

export default function AdminStandTable({ stands, busyId, onSetStatus, onEdit, onDelete }: Props) {
  if (stands.length === 0) {
    return <p className="text-sm text-gray-500 py-6">Keine Stände in dieser Ansicht.</p>;
  }

  return (
    <div className="space-y-3">
      {stands.map((s) => (
        <div key={s.id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{s.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[s.status]}`}>
                  {statusLabels[s.status] ?? s.status}
                </span>
                {s.edited_after_approval && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    bearbeitet
                  </span>
                )}
                {s.needs_public_spot && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Platz Gemeindehaus/Schule
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{s.address}</p>
            </div>
          </div>

          <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
            <div><dt className="inline font-medium">E-Mail: </dt><dd className="inline">{s.provider_email}</dd></div>
            <div><dt className="inline font-medium">Mobil: </dt><dd className="inline">{s.provider_mobile}</dd></div>
          </dl>

          <div className="mt-3 flex flex-wrap gap-2">
            {s.status !== 'approved' && (
              <button
                disabled={busyId === s.id}
                onClick={() => onSetStatus(s.id, 'approved')}
                className="text-sm rounded-md bg-green-600 text-white px-3 py-1.5 hover:bg-green-700 disabled:opacity-50"
              >
                Freigeben
              </button>
            )}
            {s.status !== 'rejected' && (
              <button
                disabled={busyId === s.id}
                onClick={() => onSetStatus(s.id, 'rejected')}
                className="text-sm rounded-md bg-amber-600 text-white px-3 py-1.5 hover:bg-amber-700 disabled:opacity-50"
              >
                Ablehnen
              </button>
            )}
            <button
              onClick={() => onEdit(s)}
              className="text-sm rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            >
              Bearbeiten
            </button>
            <Link
              to={`/stand/${s.id}`}
              className="text-sm rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
            >
              Ansehen
            </Link>
            <button
              disabled={busyId === s.id}
              onClick={() => onDelete(s.id)}
              className="text-sm rounded-md border border-red-300 text-red-600 px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
            >
              Löschen
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
