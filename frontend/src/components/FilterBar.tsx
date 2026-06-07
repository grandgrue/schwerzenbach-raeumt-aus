import type { Category, StandFilters } from '../api/types';

interface Props {
  categories: Category[];
  filters: StandFilters;
  onChange: (next: StandFilters) => void;
}

export default function FilterBar({ categories, filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg bg-white border border-gray-200 p-3">
      <label className="flex flex-col text-sm flex-1 min-w-[160px]">
        <span className="text-gray-600 mb-1">Suche</span>
        <input
          type="search"
          value={filters.q ?? ''}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Titel, Beschreibung, Adresse …"
          className="rounded-md border-gray-300 border px-3 py-1.5 focus:border-brand-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col text-sm">
        <span className="text-gray-600 mb-1">Kategorie</span>
        <select
          value={filters.category ?? ''}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value ? Number(e.target.value) : null })
          }
          className="rounded-md border-gray-300 border px-3 py-1.5 focus:border-brand-500 focus:outline-none"
        >
          <option value="">Alle</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm py-1.5">
        <input
          type="checkbox"
          checked={!!filters.food}
          onChange={(e) => onChange({ ...filters, food: e.target.checked })}
          className="rounded border-gray-300"
        />
        🍰 Essen
      </label>
      <label className="flex items-center gap-2 text-sm py-1.5">
        <input
          type="checkbox"
          checked={!!filters.drinks}
          onChange={(e) => onChange({ ...filters, drinks: e.target.checked })}
          className="rounded border-gray-300"
        />
        ☕ Getränke
      </label>

      {(filters.q || filters.category || filters.food || filters.drinks) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-sm text-brand-600 hover:underline py-1.5"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
