import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCaptcha, useCategories, useCreateStand, useEvent } from '../api/hooks';
import type { CaptchaChallenge, StandPayload } from '../api/types';
import { ApiError } from '../api/client';
import StandForm from '../components/StandForm';
import { ErrorNote, Loading } from '../components/StatusViews';

export default function RegisterPage() {
  const { data: event, isLoading } = useEvent();
  const { data: categories = [] } = useCategories();
  const createStand = useCreateStand();

  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function refreshCaptcha() {
    fetchCaptcha().then(setCaptcha).catch(() => setCaptcha(null));
    setCaptchaAnswer('');
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-6"><Loading /></div>;

  if (event && !event.registration_open) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Stand anmelden</h1>
        <ErrorNote text="Die Anmeldung ist derzeit geschlossen. Bitte schau zu einem späteren Zeitpunkt wieder vorbei." />
        <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Danke für deine Anmeldung! 🎉</h1>
        <div className="rounded-md bg-brand-50 border border-brand-100 p-4 text-gray-700 space-y-2">
          <p>
            Dein Stand wurde eingereicht und wird vom Organisationskomitee geprüft. Du erhältst
            in Kürze eine <strong>E-Mail mit deinem persönlichen Bearbeitungs-Link</strong>.
          </p>
          <p>Mit diesem Link kannst du deinen Stand jederzeit ändern oder zurückziehen.</p>
        </div>
        <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
      </div>
    );
  }

  function handleSubmit(payload: StandPayload) {
    setServerFieldErrors({});
    setGeneralError(null);
    createStand.mutate(
      {
        ...payload,
        captcha_token: captcha?.token ?? '',
        captcha_answer: Number(captchaAnswer),
        website: honeypot,
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.fields) setServerFieldErrors(error.fields);
            setGeneralError(error.message);
            refreshCaptcha();
          } else {
            setGeneralError('Unerwarteter Fehler. Bitte versuche es erneut.');
          }
        },
      },
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="text-2xl font-bold">Stand anmelden</h1>
      <p className="text-gray-600">
        Melde deinen Verkaufsstand an. Nach dem Absenden prüft das Organisationskomitee deinen
        Eintrag. Details zum Datenschutz findest du auch in den{' '}
        <Link to="/faq" className="text-brand-600 hover:underline">FAQ</Link>.
      </p>

      {generalError && <ErrorNote text={generalError} />}

      <StandForm
        categories={categories}
        event={event}
        defaultValues={{
          start_time: event?.default_start_time ?? '',
          end_time: event?.default_end_time ?? '',
        }}
        submitLabel="Stand anmelden"
        busy={createStand.isPending}
        serverFieldErrors={serverFieldErrors}
        onSubmit={handleSubmit}
      >
        {/* Honeypot (für Menschen unsichtbar) */}
        <div className="hidden" aria-hidden>
          <label>
            Website
            <input
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <label className="block text-sm font-medium text-gray-700">
            Sicherheitsfrage: {captcha?.question ?? '…'} *
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              inputMode="numeric"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
            <button type="button" onClick={refreshCaptcha} className="text-sm text-brand-600 hover:underline">
              Neue Frage
            </button>
          </div>
        </div>
      </StandForm>
    </div>
  );
}
