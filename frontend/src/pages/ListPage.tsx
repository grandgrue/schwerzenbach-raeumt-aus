import { useState } from 'react';
import { useCategories, useStands } from '../api/hooks';
import type { StandFilters } from '../api/types';
import FilterBar from '../components/FilterBar';
import StandCard from '../components/StandCard';
import { EmptyNote, ErrorNote, Loading } from '../components/StatusViews';

export default function ListPage() {
  const [filters, setFilters] = useState<StandFilters>({});
  const { data: categories = [] } = useCategories();
  const { data: stands, isLoading, isError } = useStands(filters);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Stände als Liste</h1>
      <FilterBar categories={categories} filters={filters} onChange={setFilters} />

      {isError && <ErrorNote text="Die Stände konnten nicht geladen werden." />}
      {isLoading && <Loading />}
      {stands && stands.length === 0 && (
        <EmptyNote text="Keine Stände gefunden. Passe ggf. die Filter an." />
      )}
      {stands && stands.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stands.map((stand) => (
            <StandCard key={stand.id} stand={stand} />
          ))}
        </div>
      )}
    </div>
  );
}
