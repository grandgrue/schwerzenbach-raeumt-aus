export interface EventInfo {
  name: string;
  event_date: string | null;
  default_start_time: string | null;
  default_end_time: string | null;
  registration_open: boolean;
  public_spots_total: number;
  public_spots_available: number;
  info_text: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface CategoryWithCount {
  id: number;
  name: string;
  sort_order: number;
  stand_count: number;
}

export interface StandContact {
  name: string | null;
  phone: string | null;
}

/** Öffentliche Darstellung eines Stands (ohne private Felder). */
export interface PublicStand {
  id: number;
  title: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  start_time: string | null;
  end_time: string | null;
  offers_food: boolean;
  offers_drinks: boolean;
  categories: Category[];
  contact?: StandContact;
}

export type StandStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

/** Private Darstellung (Anbieter:in via Edit-Token / Admin). */
export interface PrivateStand {
  id: number;
  title: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  provider_email: string;
  provider_mobile: string;
  public_contact_name: string | null;
  public_contact_phone: string | null;
  show_public_contact: boolean;
  start_time: string | null;
  end_time: string | null;
  offers_food: boolean;
  offers_drinks: boolean;
  needs_public_spot: boolean;
  status: StandStatus;
  edited_after_approval: boolean;
  category_ids: number[];
}

export interface CaptchaChallenge {
  question: string;
  token: string;
}

/** Eingabe für das Anlegen/Bearbeiten eines Stands. */
export interface StandPayload {
  title: string;
  description?: string | null;
  address: string;
  lat: number;
  lng: number;
  provider_email: string;
  provider_mobile: string;
  public_contact_name?: string | null;
  public_contact_phone?: string | null;
  show_public_contact: boolean;
  start_time?: string | null;
  end_time?: string | null;
  offers_food: boolean;
  offers_drinks: boolean;
  needs_public_spot: boolean;
  categories: number[];
}

export interface StandFilters {
  category?: number | null;
  food?: boolean;
  drinks?: boolean;
  q?: string;
}

export interface AdminSession {
  authenticated: boolean;
  username?: string;
  csrf_token?: string;
}

/** Vollständige Event-Konfiguration für den Admin (inkl. privater Organisator-Adressen). */
export interface AdminEvent {
  name: string;
  event_date: string | null;
  default_start_time: string | null;
  default_end_time: string | null;
  registration_open: boolean;
  public_spots_total: number;
  info_text: string | null;
  organizer_emails: string;
}
