import { useState } from 'react';
import { useCategories, useStands } from '../api/hooks';
import type { StandFilters } from '../api/types';
import FilterBar from '../components/FilterBar';
import MapView from '../components/MapView';
import { ErrorNote, Loading } from '../components/StatusViews';

export default function MapPage() {
  const [filters, setFilters] = useState<StandFilters>({});
  const { data: categories = [] } = useCategories();
  const { data: stands, isLoading, isError } = useStands(filters);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Stände auf der Karte</h1>
      <FilterBar categories={categories} filters={filters} onChange={setFilters} />

      {isError && <ErrorNote text="Die Stände konnten nicht geladen werden." />}
      {isLoading && <Loading />}
      {stands && (
        <>
          <p className="text-sm text-gray-500">{stands.length} Stand/Stände gefunden.</p>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <MapView stands={stands} />
          </div>
        </>
      )}
    </div>
  );
}
