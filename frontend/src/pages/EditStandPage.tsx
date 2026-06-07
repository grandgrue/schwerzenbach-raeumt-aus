import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useCategories,
  useEditStand,
  useEvent,
  useUpdateStand,
  useWithdrawStand,
} from '../api/hooks';
import type { StandPayload } from '../api/types';
import { ApiError } from '../api/client';
import StandForm from '../components/StandForm';
import { ErrorNote, Loading } from '../components/StatusViews';

const statusLabels: Record<string, string> = {
  pending: 'in Prüfung',
  approved: 'freigegeben',
  rejected: 'abgelehnt',
  withdrawn: 'zurückgezogen',
};

export default function EditStandPage() {
  const { token = '' } = useParams();
  const { data: event } = useEvent();
  const { data: categories = [] } = useCategories();
  const { data: stand, isLoading, isError } = useEditStand(token);
  const updateStand = useUpdateStand(token);
  const withdrawStand = useWithdrawStand(token);

  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [withdrawn, setWithdrawn] = useState(false);

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-6"><Loading /></div>;

  if (isError || !stand) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Stand bearbeiten</h1>
        <ErrorNote text="Dieser Bearbeitungs-Link ist ungültig oder der Stand wurde bereits zurückgezogen." />
        <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
      </div>
    );
  }

  if (withdrawn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Stand zurückgezogen</h1>
        <p className="text-gray-700">Dein Stand wurde zurückgezogen und ist nicht mehr sichtbar.</p>
        <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
      </div>
    );
  }

  function handleSubmit(payload: StandPayload) {
    setServerFieldErrors({});
    setGeneralError(null);
    setMessage(null);
    updateStand.mutate(payload, {
      onSuccess: () => setMessage('Deine Änderungen wurden gespeichert.'),
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.fields) setServerFieldErrors(error.fields);
          setGeneralError(error.message);
        } else {
          setGeneralError('Unerwarteter Fehler. Bitte versuche es erneut.');
        }
      },
    });
  }

  function handleWithdraw() {
    if (!window.confirm('Möchtest du deinen Stand wirklich zurückziehen?')) return;
    withdrawStand.mutate(undefined, { onSuccess: () => setWithdrawn(true) });
  }

  const defaults: Partial<StandPayload> = {
    title: stand.title,
    description: stand.description,
    address: stand.address,
    lat: stand.lat,
    lng: stand.lng,
    provider_email: stand.provider_email,
    provider_mobile: stand.provider_mobile,
    show_public_contact: stand.show_public_contact,
    public_contact_name: stand.public_contact_name,
    public_contact_phone: stand.public_contact_phone,
    start_time: stand.start_time,
    end_time: stand.end_time,
    offers_food: stand.offers_food,
    offers_drinks: stand.offers_drinks,
    needs_public_spot: stand.needs_public_spot,
    categories: stand.category_ids,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold">Stand bearbeiten</h1>
      <p className="text-sm text-gray-600">
        Status: <span className="font-medium">{statusLabels[stand.status] ?? stand.status}</span>
      </p>

      {message && (
        <div className="rounded-md bg-brand-50 border border-brand-100 px-4 py-3 text-sm text-brand-700">
          {message}
        </div>
      )}
      {generalError && <ErrorNote text={generalError} />}

      <StandForm
        categories={categories}
        event={event}
        defaultValues={defaults}
        submitLabel="Änderungen speichern"
        busy={updateStand.isPending}
        serverFieldErrors={serverFieldErrors}
        onSubmit={handleSubmit}
      />

      <div className="border-t pt-4">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={withdrawStand.isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          Stand zurückziehen
        </button>
      </div>
    </div>
  );
}
