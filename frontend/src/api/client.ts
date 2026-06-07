export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE = '/api';

/** Vom Admin-Login gesetztes CSRF-Token (für mutierende Admin-Requests). */
let csrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** CSRF-Header mitsenden (für mutierende Admin-Requests). */
  csrf?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, csrf = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (csrf && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err: ApiErrorBody = (data && data.error) || {
      code: 'unknown',
      message: 'Unbekannter Fehler',
    };
    throw new ApiError(response.status, err.code, err.message, err.fields);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, csrf = false) =>
    request<T>(path, { method: 'POST', body, csrf }),
  put: <T>(path: string, body?: unknown, csrf = false) =>
    request<T>(path, { method: 'PUT', body, csrf }),
  patch: <T>(path: string, body?: unknown, csrf = false) =>
    request<T>(path, { method: 'PATCH', body, csrf }),
  delete: <T>(path: string, csrf = false) =>
    request<T>(path, { method: 'DELETE', csrf }),
};

export function buildStandsQuery(filters: {
  category?: number | null;
  food?: boolean;
  drinks?: boolean;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', String(filters.category));
  if (filters.food) params.set('food', '1');
  if (filters.drinks) params.set('drinks', '1');
  if (filters.q && filters.q.trim() !== '') params.set('q', filters.q.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
