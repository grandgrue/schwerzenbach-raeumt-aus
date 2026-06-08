import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCaptcha, useResendLink } from '../api/hooks';
import type { CaptchaChallenge } from '../api/types';
import { ApiError } from '../api/client';
import { ErrorNote } from '../components/StatusViews';

export default function RequestLinkPage() {
  const resend = useResendLink();
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function refreshCaptcha() {
    fetchCaptcha().then(setCaptcha).catch(() => setCaptcha(null));
    setCaptchaAnswer('');
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    resend.mutate(
      {
        email,
        captcha_token: captcha?.token ?? '',
        captcha_answer: Number(captchaAnswer),
        website: honeypot,
      },
      {
        onSuccess: () => setDone(true),
        onError: (err) => {
          setError(err instanceof ApiError ? err.message : 'Unerwarteter Fehler.');
          refreshCaptcha();
        },
      },
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">Anfrage gesendet</h1>
        <div className="rounded-md bg-brand-50 border border-brand-100 p-4 text-gray-700">
          Falls zu dieser E-Mail-Adresse Stände bestehen, haben wir dir soeben eine Nachricht mit
          dem/den aktuellen Bearbeitungs-Link(s) geschickt. Bitte prüfe dein Postfach (und den
          Spam-Ordner).
        </div>
        <Link to="/" className="text-brand-600 hover:underline">← Zur Startseite</Link>
      </div>
    );
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none';

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-5">
      <h1 className="text-2xl font-bold">Bearbeitungs-Link anfordern</h1>
      <p className="text-gray-600">
        Du hast deinen Bearbeitungs-Link nicht mehr? Gib die E-Mail-Adresse ein, mit der du deinen
        Stand angemeldet hast – wir senden dir einen neuen Link für alle deine Einträge.
      </p>
      <p className="text-xs text-gray-500">
        Hinweis: Aus Sicherheitsgründen werden dabei neue Links erstellt; früher erhaltene Links
        werden ungültig.
      </p>

      {error && <ErrorNote text={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">E-Mail-Adresse *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Honeypot */}
        <div className="hidden" aria-hidden>
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <label className="block text-sm font-medium text-gray-700">
            Sicherheitsfrage: {captcha?.question ?? '…'} *
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              inputMode="numeric"
              required
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
            <button type="button" onClick={refreshCaptcha} className="text-sm text-brand-600 hover:underline">
              Neue Frage
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={resend.isPending}
          className="w-full rounded-md bg-brand-600 px-6 py-2.5 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {resend.isPending ? 'Wird gesendet …' : 'Link zusenden'}
        </button>
      </form>
    </div>
  );
}
