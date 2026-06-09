import { useState } from 'react';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../api/hooks';
import { ApiError } from '../api/client';
import { ErrorNote, Loading } from './StatusViews';

export default function CategoryManager() {
  const { data: categories, isLoading, isError } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [edited, setEdited] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  function handleError(e: unknown) {
    setError(e instanceof ApiError ? e.message : 'Aktion fehlgeschlagen');
  }

  function add() {
    const name = newName.trim();
    if (name === '') return;
    setError(null);
    createCategory.mutate(name, {
      onSuccess: () => setNewName(''),
      onError: handleError,
    });
  }

  function rename(id: number, fallback: string) {
    const name = (edited[id] ?? fallback).trim();
    if (name === '') return;
    setError(null);
    updateCategory.mutate(
      { id, name },
      { onError: handleError, onSuccess: () => setEdited((s) => ({ ...s, [id]: undefined as unknown as string })) },
    );
  }

  function remove(id: number) {
    if (!window.confirm('Diese Kategorie löschen?')) return;
    setError(null);
    deleteCategory.mutate(id, { onError: handleError });
  }

  return (
    <section className="card p-4 space-y-4">
      <h2 className="text-lg font-semibold">Kategorien verwalten</h2>
      {error && <ErrorNote text={error} />}
      {isError && <ErrorNote text="Kategorien konnten nicht geladen werden." />}
      {isLoading && <Loading />}

      {categories && (
        <ul className="divide-y divide-gray-100">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 py-2">
              <input
                value={edited[c.id] ?? c.name}
                onChange={(e) => setEdited((s) => ({ ...s, [c.id]: e.target.value }))}
                className="flex-1 min-w-[160px] rounded-md border border-gold px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
              <span className="text-xs text-gray-500 w-24">
                {c.stand_count} Stand/Stände
              </span>
              <button
                onClick={() => rename(c.id, c.name)}
                disabled={updateCategory.isPending || (edited[c.id] ?? c.name) === c.name}
                className="text-sm rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                Speichern
              </button>
              <button
                onClick={() => remove(c.id)}
                disabled={c.stand_count > 0 || deleteCategory.isPending}
                title={c.stand_count > 0 ? 'Wird von Ständen genutzt – nicht löschbar' : 'Löschen'}
                className="text-sm rounded-md border border-red-300 text-red-600 px-3 py-1.5 hover:bg-red-50 disabled:opacity-40"
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 border-t pt-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Neue Kategorie"
          className="flex-1 rounded-md border border-gold px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <button
          onClick={add}
          disabled={createCategory.isPending || newName.trim() === ''}
          className="rounded-pill bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark disabled:opacity-50"
        >
          Hinzufügen
        </button>
      </div>
    </section>
  );
}
