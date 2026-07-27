import { useState } from 'react';
import {
  useAdminDeleteStand,
  useAdminEvent,
  useAdminLogin,
  useAdminLogout,
  useAdminSession,
  useAdminStands,
  useAdminUpdateEvent,
  useAdminUpdateStand,
  useCategories,
  useEvent,
} from '../api/hooks';
import { ApiError, api } from '../api/client';
import type { PrivateStand, StandPayload } from '../api/types';
import AdminStandTable from '../components/AdminStandTable';
import CategoryManager from '../components/CategoryManager';
import EventConfigForm from '../components/EventConfigForm';
import StandForm from '../components/StandForm';
import { ErrorNote, Loading } from '../components/StatusViews';

function privateToPayload(s: PrivateStand): Partial<StandPayload> {
  return {
    title: s.title,
    description: s.description,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    provider_email: s.provider_email,
    provider_mobile: s.provider_mobile,
    show_public_contact: s.show_public_contact,
    public_contact_name: s.public_contact_name,
    public_contact_phone: s.public_contact_phone,
    start_time: s.start_time,
    end_time: s.end_time,
    offers_food: s.offers_food,
    offers_drinks: s.offers_drinks,
    needs_public_spot: s.needs_public_spot,
    categories: s.category_ids,
  };
}

const statusTabs = [
  { value: 'pending', label: 'In Prüfung' },
  { value: 'approved', label: 'Freigegeben' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'withdrawn', label: 'Zurückgezogen' },
  { value: '', label: 'Alle' },
];

type AdminSection = 'moderation' | 'categories' | 'event';

const sectionTabs: { value: AdminSection; label: string }[] = [
  { value: 'moderation', label: 'Moderation' },
  { value: 'categories', label: 'Kategorien' },
  { value: 'event', label: 'Event-Konfiguration' },
];

function LoginForm() {
  const login = useAdminLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    login.mutate(
      { username, password },
      {
        onError: (err) =>
          setError(err instanceof ApiError ? err.message : 'Anmeldung fehlgeschlagen'),
      },
    );
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gold px-3 py-2 focus:border-accent focus:outline-none';

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Organisator:innen-Login</h1>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorNote text={error} />}
        <div>
          <label className="block text-sm font-medium text-gray-700">Benutzername</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} autoFocus />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Passwort</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-pill bg-accent px-5 py-2.5 text-white font-medium hover:bg-accent-dark disabled:opacity-50"
        >
          {login.isPending ? 'Anmelden …' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ username }: { username?: string }) {
  const logout = useAdminLogout();
  const [status, setStatus] = useState('pending');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);

  const { data: stands, isLoading, isError } = useAdminStands(status);
  const updateStand = useAdminUpdateStand();
  const deleteStand = useAdminDeleteStand();
  const { data: event } = useEvent();
  const { data: adminEvent } = useAdminEvent();
  const { data: categories = [] } = useCategories();
  const updateEvent = useAdminUpdateEvent();

  const [section, setSection] = useState<AdminSection>('moderation');
  const [editStand, setEditStand] = useState<PrivateStand | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function exportExcel() {
    setExporting(true);
    setExportError(null);
    try {
      const rows = await api.get<PrivateStand[]>('/admin/stands?status=approved');
      const catName = new Map(categories.map((c) => [c.id, c.name]));
      const data = rows.map((s) => ({
        ...s,
        cats: s.category_ids.map((id) => catName.get(id) ?? String(id)).join(', '),
      }));
      type Row = (typeof data)[number];
      const schema = [
        { column: 'Titel', type: String, value: (s: Row) => s.title },
        { column: 'Beschreibung', type: String, value: (s: Row) => s.description ?? '' },
        { column: 'Adresse', type: String, value: (s: Row) => s.address },
        { column: 'Platz-Typ', type: String, value: (s: Row) => (s.needs_public_spot ? 'Gemeindehaus/Schule' : 'Zuhause') },
        { column: 'Kategorien', type: String, value: (s: Row) => s.cats },
        { column: 'Verkauf von', type: String, value: (s: Row) => s.start_time ?? '' },
        { column: 'Verkauf bis', type: String, value: (s: Row) => s.end_time ?? '' },
        { column: 'Essen', type: String, value: (s: Row) => (s.offers_food ? 'ja' : 'nein') },
        { column: 'Getränke', type: String, value: (s: Row) => (s.offers_drinks ? 'ja' : 'nein') },
        { column: 'E-Mail (privat)', type: String, value: (s: Row) => s.provider_email },
        { column: 'Mobil (privat)', type: String, value: (s: Row) => s.provider_mobile },
        { column: 'Öffentl. Name', type: String, value: (s: Row) => s.public_contact_name ?? '' },
        { column: 'Öffentl. Telefon', type: String, value: (s: Row) => s.public_contact_phone ?? '' },
        { column: 'Öffentl. Kontakt sichtbar', type: String, value: (s: Row) => (s.show_public_contact ? 'ja' : 'nein') },
        { column: 'Breite', type: Number, value: (s: Row) => s.lat },
        { column: 'Länge', type: Number, value: (s: Row) => s.lng },
      ];
      const writeXlsxFile = (await import('write-excel-file/browser')).default as unknown as (
        rows: unknown,
        options: unknown,
      ) => Promise<void>;
      await writeXlsxFile(data, { schema, fileName: 'staende-schwerzenbach-raeumt-aus.xlsx' });
    } catch (e) {
      setExportError(e instanceof ApiError ? e.message : 'Export fehlgeschlagen.');
    } finally {
      setExporting(false);
    }
  }

  function saveStandEdit(payload: StandPayload) {
    if (!editStand) return;
    setEditError(null);
    updateStand.mutate(
      { id: editStand.id, body: payload as unknown as Record<string, unknown> },
      {
        onSuccess: () => setEditStand(null),
        onError: (e) => setEditError(e instanceof ApiError ? e.message : 'Speichern fehlgeschlagen'),
      },
    );
  }

  function setStandStatus(id: number, newStatus: string) {
    setBusyId(id);
    updateStand.mutate({ id, body: { status: newStatus } }, { onSettled: () => setBusyId(null) });
  }

  function removeStand(id: number) {
    if (!window.confirm('Diesen Stand endgültig löschen?')) return;
    setBusyId(id);
    deleteStand.mutate(id, { onSettled: () => setBusyId(null) });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administration</h1>
        <div className="text-sm text-gray-600">
          {username && <span className="mr-3">Angemeldet als {username}</span>}
          <button onClick={() => logout.mutate()} className="text-brand-600 hover:underline">
            Abmelden
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-gray-200">
        {sectionTabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setSection(t.value)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              section === t.value
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {section === 'moderation' && (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`text-sm rounded-full px-3 py-1.5 ${
                status === tab.value ? 'bg-brand-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
          <button
            type="button"
            onClick={exportExcel}
            disabled={exporting}
            className="btn-primary text-sm !py-2 !px-4 disabled:opacity-50"
            title="Freigegebene Stände inkl. Kontaktdaten als Excel herunterladen"
          >
            {exporting ? 'Export läuft …' : '⬇ Als Excel exportieren'}
          </button>
        </div>

        {exportError && <div className="mb-3"><ErrorNote text={exportError} /></div>}
        {isError && <ErrorNote text="Die Stände konnten nicht geladen werden." />}
        {isLoading && <Loading />}
        {stands && (
          <AdminStandTable
            stands={stands}
            busyId={busyId}
            onSetStatus={setStandStatus}
            onEdit={setEditStand}
            onDelete={removeStand}
          />
        )}
      </div>
      )}

      {section === 'categories' && <CategoryManager />}

      {section === 'event' && adminEvent && (
        <EventConfigForm
          event={adminEvent}
          busy={updateEvent.isPending}
          message={eventMessage}
          onSave={(body) => {
            setEventMessage(null);
            updateEvent.mutate(body, {
              onSuccess: () => setEventMessage('Event-Konfiguration gespeichert.'),
            });
          }}
        />
      )}

      {editStand && (
        <div className="fixed inset-0 z-[2000] bg-black/40 overflow-y-auto" onClick={() => setEditStand(null)}>
          <div
            className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Stand bearbeiten</h2>
              <button onClick={() => setEditStand(null)} className="text-gray-500 hover:text-gray-800" aria-label="Schliessen">
                ✕
              </button>
            </div>
            {editError && <div className="mb-3"><ErrorNote text={editError} /></div>}
            <StandForm
              categories={categories}
              event={event}
              defaultValues={privateToPayload(editStand)}
              submitLabel="Änderungen speichern"
              busy={updateStand.isPending}
              onSubmit={saveStandEdit}
              allowPublicPin
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { data: session, isLoading } = useAdminSession();

  if (isLoading) return <div className="py-12"><Loading /></div>;
  if (!session?.authenticated) return <LoginForm />;
  return <Dashboard username={session.username} />;
}
