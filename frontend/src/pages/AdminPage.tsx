import { useState } from 'react';
import {
  useAdminDeleteStand,
  useAdminLogin,
  useAdminLogout,
  useAdminSession,
  useAdminStands,
  useAdminUpdateEvent,
  useAdminUpdateStand,
  useEvent,
} from '../api/hooks';
import { ApiError } from '../api/client';
import AdminStandTable from '../components/AdminStandTable';
import EventConfigForm from '../components/EventConfigForm';
import { ErrorNote, Loading } from '../components/StatusViews';

const statusTabs = [
  { value: 'pending', label: 'In Prüfung' },
  { value: 'approved', label: 'Freigegeben' },
  { value: 'rejected', label: 'Abgelehnt' },
  { value: 'withdrawn', label: 'Zurückgezogen' },
  { value: '', label: 'Alle' },
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
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none';

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
          className="w-full rounded-md bg-brand-600 px-5 py-2.5 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
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
  const updateEvent = useAdminUpdateEvent();

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
        <h1 className="text-2xl font-bold">Moderation</h1>
        <div className="text-sm text-gray-600">
          {username && <span className="mr-3">Angemeldet als {username}</span>}
          <button onClick={() => logout.mutate()} className="text-brand-600 hover:underline">
            Abmelden
          </button>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
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

        {isError && <ErrorNote text="Die Stände konnten nicht geladen werden." />}
        {isLoading && <Loading />}
        {stands && (
          <AdminStandTable
            stands={stands}
            busyId={busyId}
            onSetStatus={setStandStatus}
            onDelete={removeStand}
          />
        )}
      </div>

      {event && (
        <EventConfigForm
          event={event}
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
    </div>
  );
}

export default function AdminPage() {
  const { data: session, isLoading } = useAdminSession();

  if (isLoading) return <div className="py-12"><Loading /></div>;
  if (!session?.authenticated) return <LoginForm />;
  return <Dashboard username={session.username} />;
}
