import { describe, expect, it } from 'vitest';
import { verifierPlafonds } from './measure-bundle.mjs';

describe('measure-bundle — plafonds', () => {
  it('accepte un rapport sous les plafonds', () => {
    expect(
      verifierPlafonds(
        { distKo: 500, cssKo: 100, jsKo: 70, appJsGzipKo: 30, iconsKo: 10 },
        { distKo: 640, cssKo: 125, jsKo: 95, appJsGzipKo: 45, iconsKo: 18 }
      )
    ).toEqual([]);
  });

  it('signale les dépassements', () => {
    const depassements = verifierPlafonds(
      { distKo: 700, cssKo: 100, jsKo: 70, appJsGzipKo: 50, iconsKo: 10 },
      { distKo: 640, cssKo: 125, jsKo: 95, appJsGzipKo: 45, iconsKo: 18 }
    );
    expect(depassements).toContain('distKo: 700 > 640');
    expect(depassements).toContain('appJsGzipKo: 50 > 45');
  });
});
