import type { Category } from '../api/types';

export default function CategoryBadges({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((c) => (
        <span
          key={c.id}
          className="inline-block rounded-full bg-brand-50 text-brand-700 text-xs px-2 py-0.5"
        >
          {c.name}
        </span>
      ))}
    </div>
  );
}

export function OfferBadges({ food, drinks }: { food: boolean; drinks: boolean }) {
  if (!food && !drinks) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {food && (
        <span className="inline-block rounded-full bg-amber-50 text-amber-700 text-xs px-2 py-0.5">
          🍰 Essen (Spende)
        </span>
      )}
      {drinks && (
        <span className="inline-block rounded-full bg-sky-50 text-sky-700 text-xs px-2 py-0.5">
          ☕ Getränke (Spende)
        </span>
      )}
    </div>
  );
}
