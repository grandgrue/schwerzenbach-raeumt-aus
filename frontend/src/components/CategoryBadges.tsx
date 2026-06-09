import type { Category } from '../api/types';

export default function CategoryBadges({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {categories.map((c) => (
        <span
          key={c.id}
          className="inline-block rounded-pill bg-primary-light text-ink-dark text-xs font-bold px-2.5 py-0.5"
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
        <span className="inline-block rounded-pill bg-accent/15 text-accent-dark text-xs font-bold px-2.5 py-0.5">
          🍰 Essen (Spende)
        </span>
      )}
      {drinks && (
        <span className="inline-block rounded-pill bg-ink-dark/10 text-ink-dark text-xs font-bold px-2.5 py-0.5">
          ☕ Getränke (Spende)
        </span>
      )}
    </div>
  );
}
