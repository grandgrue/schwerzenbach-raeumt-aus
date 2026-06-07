import { describe, expect, it } from 'vitest';
import { buildWalkingUrl } from './NavigateButton';

describe('buildWalkingUrl', () => {
  it('erzeugt eine Google-Maps-Directions-URL im Fussgänger-Modus', () => {
    const url = buildWalkingUrl(47.38239, 8.65643);
    expect(url).toContain('travelmode=walking');
    expect(url).toContain(encodeURIComponent('47.38239,8.65643'));
    expect(url.startsWith('https://')).toBe(true);
  });
});
