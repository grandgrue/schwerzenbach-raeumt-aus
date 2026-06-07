import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, buildStandsQuery, setCsrfToken } from './client';
import type {
  AdminSession,
  CaptchaChallenge,
  Category,
  CategoryWithCount,
  EventInfo,
  PrivateStand,
  PublicStand,
  StandFilters,
  StandPayload,
} from './types';

// --- Öffentlich ------------------------------------------------------------

export function useEvent() {
  return useQuery({
    queryKey: ['event'],
    queryFn: () => api.get<EventInfo>('/event'),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStands(filters: StandFilters) {
  return useQuery({
    queryKey: ['stands', filters],
    queryFn: () => api.get<PublicStand[]>(`/stands${buildStandsQuery(filters)}`),
  });
}

export function useStand(id: number) {
  return useQuery({
    queryKey: ['stand', id],
    queryFn: () => api.get<PublicStand>(`/stands/${id}`),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function fetchCaptcha() {
  return api.get<CaptchaChallenge>('/captcha');
}

// --- Anbieter:in (kontolos) ------------------------------------------------

export interface CreateStandInput extends StandPayload {
  captcha_token: string;
  captcha_answer: number;
  website?: string; // Honeypot
}

export function useCreateStand() {
  return useMutation({
    mutationFn: (input: CreateStandInput) =>
      api.post<{ id: number; status: string }>('/stands', input),
  });
}

export function useEditStand(token: string) {
  return useQuery({
    queryKey: ['edit-stand', token],
    queryFn: () => api.get<PrivateStand>(`/stands/edit/${token}`),
    enabled: token.length > 0,
    retry: false,
  });
}

export function useUpdateStand(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StandPayload) =>
      api.put<PrivateStand>(`/stands/edit/${token}`, payload),
    onSuccess: (data) => qc.setQueryData(['edit-stand', token], data),
  });
}

export function useWithdrawStand(token: string) {
  return useMutation({
    mutationFn: () => api.delete<void>(`/stands/edit/${token}`),
  });
}

// --- Admin -----------------------------------------------------------------

export function useAdminSession() {
  return useQuery({
    queryKey: ['admin-session'],
    queryFn: async () => {
      const session = await api.get<AdminSession>('/admin/session');
      setCsrfToken(session.csrf_token ?? null);
      return session;
    },
  });
}

export function useAdminLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (creds: { username: string; password: string }) =>
      api.post<{ username: string; csrf_token: string }>('/admin/login', creds),
    onSuccess: (data) => {
      setCsrfToken(data.csrf_token);
      qc.setQueryData<AdminSession>(['admin-session'], {
        authenticated: true,
        username: data.username,
        csrf_token: data.csrf_token,
      });
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/admin/logout', undefined, true),
    onSuccess: () => {
      setCsrfToken(null);
      qc.setQueryData<AdminSession>(['admin-session'], { authenticated: false });
      qc.invalidateQueries({ queryKey: ['admin-stands'] });
    },
  });
}

export function useAdminStands(status: string | null) {
  return useQuery({
    queryKey: ['admin-stands', status],
    queryFn: () =>
      api.get<PrivateStand[]>(`/admin/stands${status ? `?status=${status}` : ''}`),
  });
}

export function useAdminUpdateStand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      api.patch<PrivateStand>(`/admin/stands/${id}`, body, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-stands'] }),
  });
}

export function useAdminDeleteStand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/admin/stands/${id}`, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-stands'] }),
  });
}

export function useAdminUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<{ ok: boolean }>('/admin/event', body, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event'] }),
  });
}

// --- Admin: Kategorien -----------------------------------------------------

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get<CategoryWithCount[]>('/admin/categories'),
  });
}

function invalidateCategories(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['admin-categories'] });
  qc.invalidateQueries({ queryKey: ['categories'] });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<{ id: number }>('/admin/categories', { name }, true),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.patch<{ ok: boolean }>(`/admin/categories/${id}`, { name }, true),
    onSuccess: () => invalidateCategories(qc),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/admin/categories/${id}`, true),
    onSuccess: () => invalidateCategories(qc),
  });
}
