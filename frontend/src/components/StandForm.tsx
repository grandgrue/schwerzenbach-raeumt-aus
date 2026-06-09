import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Category, EventInfo, StandPayload } from '../api/types';
import { geocodeAddress } from '../lib/geocode';
import { SCHWERZENBACH_CENTER } from '../lib/leaflet';
import PinPicker from './PinPicker';

type GeoStatus = 'idle' | 'loading' | 'found' | 'notfound' | 'error';

/** Adresse/Standort für Stände beim Gemeindehaus / an der Schule. */
const PUBLIC_SPOT_ADDRESS = 'Parkplatz Gemeindehaus / Primarschule, 8603 Schwerzenbach';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const optionalTime = z.union([z.literal(''), z.string().regex(timeRegex, 'Zeit als HH:MM')]);

const schema = z.object({
  title: z.string().min(1, 'Bitte einen Titel angeben').max(150),
  description: z.string().max(5000).optional(),
  address: z.string().min(1, 'Bitte eine Adresse angeben').max(255),
  lat: z.number({ invalid_type_error: 'Bitte Standort auf der Karte setzen' }),
  lng: z.number({ invalid_type_error: 'Bitte Standort auf der Karte setzen' }),
  provider_email: z.string().min(1, 'Pflichtfeld').email('Keine gültige E-Mail-Adresse'),
  provider_mobile: z.string().min(1, 'Pflichtfeld').max(40),
  show_public_contact: z.boolean(),
  public_contact_name: z.string().max(150).optional(),
  public_contact_phone: z.string().max(40).optional(),
  start_time: optionalTime.optional(),
  end_time: optionalTime.optional(),
  offers_food: z.boolean(),
  offers_drinks: z.boolean(),
  needs_public_spot: z.boolean(),
  categories: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  categories: Category[];
  event?: EventInfo;
  defaultValues?: Partial<StandPayload>;
  submitLabel: string;
  busy?: boolean;
  serverFieldErrors?: Record<string, string>;
  onSubmit: (payload: StandPayload) => void;
  children?: ReactNode;
}

export default function StandForm({
  categories,
  event,
  defaultValues,
  submitLabel,
  busy,
  serverFieldErrors,
  onSubmit,
  children,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      address: defaultValues?.address ?? '',
      lat: defaultValues?.lat as number,
      lng: defaultValues?.lng as number,
      provider_email: defaultValues?.provider_email ?? '',
      provider_mobile: defaultValues?.provider_mobile ?? '',
      show_public_contact: defaultValues?.show_public_contact ?? false,
      public_contact_name: defaultValues?.public_contact_name ?? '',
      public_contact_phone: defaultValues?.public_contact_phone ?? '',
      start_time: defaultValues?.start_time ?? '',
      end_time: defaultValues?.end_time ?? '',
      offers_food: defaultValues?.offers_food ?? false,
      offers_drinks: defaultValues?.offers_drinks ?? false,
      needs_public_spot: defaultValues?.needs_public_spot ?? false,
      categories: defaultValues?.categories ?? [],
    },
  });

  // Serverseitige Feldfehler in das Formular übernehmen.
  useEffect(() => {
    if (!serverFieldErrors) return;
    for (const [field, message] of Object.entries(serverFieldErrors)) {
      setError(field as keyof FormValues, { message });
    }
  }, [serverFieldErrors, setError]);

  const lat = watch('lat');
  const lng = watch('lng');
  const selectedCategories = watch('categories');
  const showContact = watch('show_public_contact');
  const needsSpot = watch('needs_public_spot');

  const spotsAvailable = event?.public_spots_available ?? 0;
  const spotDisabled = !needsSpot && spotsAvailable <= 0;

  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');

  async function doGeocode() {
    const address = (getValues('address') || '').trim();
    if (address === '') return;
    setGeoStatus('loading');
    try {
      const result = await geocodeAddress(address);
      if (result) {
        setValue('lat', result.lat, { shouldValidate: true });
        setValue('lng', result.lng, { shouldValidate: true });
        setGeoStatus('found');
      } else {
        setGeoStatus('notfound');
      }
    } catch {
      setGeoStatus('error');
    }
  }

  function chooseLocation(type: 'home' | 'public') {
    if (type === 'public') {
      setValue('needs_public_spot', true, { shouldValidate: true });
      setValue('address', PUBLIC_SPOT_ADDRESS, { shouldValidate: true });
      setValue('lat', SCHWERZENBACH_CENTER[0], { shouldValidate: true });
      setValue('lng', SCHWERZENBACH_CENTER[1], { shouldValidate: true });
      setGeoStatus('idle');
    } else {
      setValue('needs_public_spot', false, { shouldValidate: true });
      // Falls zuvor der Gemeindehaus-Platz aktiv war, Standortfelder leeren.
      if (getValues('address') === PUBLIC_SPOT_ADDRESS) {
        setValue('address', '', { shouldValidate: true });
        setValue('lat', undefined as unknown as number, { shouldValidate: false });
        setValue('lng', undefined as unknown as number, { shouldValidate: false });
      }
    }
  }

  const addressField = register('address');
  const hasPin = Number.isFinite(lat) && Number.isFinite(lng);

  function toggleCategory(id: number, checked: boolean) {
    const next = checked
      ? [...selectedCategories, id]
      : selectedCategories.filter((c) => c !== id);
    setValue('categories', next, { shouldValidate: true });
  }

  function submit(values: FormValues) {
    onSubmit({
      title: values.title,
      description: values.description || null,
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      provider_email: values.provider_email,
      provider_mobile: values.provider_mobile,
      show_public_contact: values.show_public_contact,
      public_contact_name: values.public_contact_name || null,
      public_contact_phone: values.public_contact_phone || null,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      offers_food: values.offers_food,
      offers_drinks: values.offers_drinks,
      needs_public_spot: values.needs_public_spot,
      categories: values.categories,
    });
  }

  const err = (name: keyof FormValues) =>
    errors[name] ? <p className="text-sm text-red-600 mt-1">{errors[name]?.message as string}</p> : null;

  const inputClass =
    'mt-1 w-full rounded-md border border-gold px-3 py-2 focus:border-accent focus:outline-none';

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titel des Stands *</label>
        <input {...register('title')} className={inputClass} placeholder="z. B. Garagenflohmi Familie Muster" />
        {err('title')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
        <textarea {...register('description')} rows={3} className={inputClass} placeholder="Was bietest du an?" />
        {err('description')}
      </div>

      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-gray-700">Wo bietest du an? *</legend>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            name="location_type"
            checked={!needsSpot}
            onChange={() => chooseLocation('home')}
            className="mt-1"
          />
          <span>
            <strong>Bei mir zuhause</strong> (Garage, Vorplatz …) – du gibst die Adresse an,
            der Pin wird automatisch gesetzt und ist verschiebbar.
          </span>
        </label>
        <label className={`flex items-start gap-2 text-sm ${spotDisabled ? 'opacity-50' : ''}`}>
          <input
            type="radio"
            name="location_type"
            checked={needsSpot}
            disabled={spotDisabled}
            onChange={() => chooseLocation('public')}
            className="mt-1"
          />
          <span>
            <strong>Beim Gemeindehaus / an der Schule</strong> – begrenzte Plätze, der Standort
            wird automatisch dort gesetzt.{' '}
            <span className="text-xs text-gray-500">
              {spotsAvailable > 0
                ? `Noch ${spotsAvailable} Platz/Plätze verfügbar.`
                : 'Aktuell ausgebucht.'}
            </span>
          </span>
        </label>
        <p className="text-xs text-gray-500">
          Alle, die keine Möglichkeit haben bei sich zuhause einen Stand aufzustellen, können
          einen Platz beim Gemeindehaus oder der Primarschule buchen. Die Plätze werden nach
          Anmelde-Eingang vergeben.
        </p>
      </fieldset>

      {!needsSpot && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse * (in Schwerzenbach)</label>
            <div className="flex gap-2 mt-1">
              <input
                {...addressField}
                onBlur={(e) => {
                  addressField.onBlur(e);
                  if (!hasPin) void doGeocode();
                }}
                className={inputClass + ' !mt-0 flex-1'}
                placeholder="z. B. Bahnhofstrasse 1"
              />
              <button
                type="button"
                onClick={() => void doGeocode()}
                className="shrink-0 rounded-md border border-brand-500 text-brand-600 px-3 py-2 text-sm hover:bg-brand-50"
              >
                📍 Pin setzen
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Der Ort «8603 Schwerzenbach» wird automatisch ergänzt.
            </p>
            {geoStatus === 'loading' && <p className="text-xs text-gray-500">Adresse wird gesucht …</p>}
            {geoStatus === 'found' && <p className="text-xs text-brand-600">Pin anhand der Adresse gesetzt – du kannst ihn unten noch verschieben.</p>}
            {geoStatus === 'notfound' && (
              <p className="text-xs text-amber-600">Adresse nicht gefunden – bitte setze den Pin unten von Hand.</p>
            )}
            {geoStatus === 'error' && (
              <p className="text-xs text-amber-600">Adresssuche nicht möglich – bitte setze den Pin unten von Hand.</p>
            )}
            {err('address')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Standort auf der Karte *</label>
            <div className="mt-1">
              <PinPicker
                value={hasPin ? { lat, lng } : null}
                onChange={(v) => {
                  setValue('lat', v.lat, { shouldValidate: true });
                  setValue('lng', v.lng, { shouldValidate: true });
                }}
              />
            </div>
            {err('lat')}
          </div>
        </>
      )}

      {needsSpot && (
        <div className="rounded-md bg-brand-50 p-3 text-sm text-gray-700">
          Dein Standplatz wird beim <strong>Gemeindehaus / an der Schule</strong> zugeteilt –
          du musst keine eigene Adresse angeben.
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Kategorien</legend>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCategories.includes(c.id)}
                onChange={(e) => toggleCategory(c.id, e.target.checked)}
                className="rounded border-gray-300"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Verkauf von</label>
          <input type="time" {...register('start_time')} className={inputClass} />
          {err('start_time')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Verkauf bis</label>
          <input type="time" {...register('end_time')} className={inputClass} />
          {err('end_time')}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Angebot auf Spendenbasis</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('offers_food')} className="rounded border-gray-300" />
          Ich biete Essen auf Spendenbasis an
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('offers_drinks')} className="rounded border-gray-300" />
          Ich biete Getränke auf Spendenbasis an
        </label>
        <p className="text-xs text-ink-light">
          Hinweis: Ein <strong>Verkauf</strong> von Essen und Getränken ist nicht gestattet —
          nur auf <strong>Spendenbasis</strong>.
        </p>
      </fieldset>

      <div className="border-t pt-4 space-y-4">
        <p className="text-sm text-gray-600">
          <strong>Datenschutz:</strong> Deine Angaben werden nur für diesen Anlass gespeichert.
          E-Mail und Mobilnummer werden <strong>nicht veröffentlicht</strong> (E-Mail für deinen
          Bearbeitungs-Link, Mobilnummer nur fürs Organisationskomitee). Du entscheidest unten
          selbst, welche Kontaktangaben öffentlich sichtbar sind.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-Mail (privat) *</label>
            <input type="email" {...register('provider_email')} className={inputClass} />
            {err('provider_email')}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobilnummer (privat, fürs OK) *</label>
            <input {...register('provider_mobile')} className={inputClass} placeholder="079 …" />
            {err('provider_mobile')}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('show_public_contact')} className="rounded border-gray-300" />
          Öffentlichen Kontakt anzeigen (du wählst unten, welche Angaben)
        </label>

        {showContact && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Öffentlicher Name</label>
              <input {...register('public_contact_name')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Öffentliche Telefonnummer</label>
              <input {...register('public_contact_phone')} className={inputClass} />
            </div>
          </div>
        )}
      </div>

      {children}

      <button
        type="submit"
        disabled={busy}
        className="w-full sm:w-auto rounded-pill bg-accent px-6 py-2.5 text-white font-medium hover:bg-accent-dark disabled:opacity-50"
      >
        {busy ? 'Wird gespeichert …' : submitLabel}
      </button>
    </form>
  );
}
