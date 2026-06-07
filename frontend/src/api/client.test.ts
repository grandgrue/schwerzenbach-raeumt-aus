import { describe, expect, it } from 'vitest';
import { buildStandsQuery } from './client';

describe('buildStandsQuery', () => {
  it('liefert einen leeren String ohne Filter', () => {
    expect(buildStandsQuery({})).toBe('');
  });

  it('serialisiert Kategorie und Essen-Filter', () => {
    expect(buildStandsQuery({ category: 3, food: true })).toBe('?category=3&food=1');
  });

  it('ignoriert eine leere Suche', () => {
    expect(buildStandsQuery({ q: '   ' })).toBe('');
  });

  it('trimmt die Suchanfrage', () => {
    expect(buildStandsQuery({ q: ' Stuhl ' })).toBe('?q=Stuhl');
  });

  it('kombiniert mehrere Filter', () => {
    expect(buildStandsQuery({ category: 2, drinks: true, q: 'Buch' })).toBe(
      '?category=2&drinks=1&q=Buch',
    );
  });
});
