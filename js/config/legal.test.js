import { describe, expect, it } from 'vitest';
import { MENTIONS_LEGALES, LIBELLES_ANCRES_MENTIONS } from './legal.js';

describe('legal config', () => {
  it('expose les ancres attendues par le footer', () => {
    const ids = MENTIONS_LEGALES.sections.map((s) => s.id);
    expect(ids).toContain('propriete-intellectuelle');
    expect(ids).toContain('donnees-personnelles');
    expect(ids).toContain('cookies-traceurs');
  });

  it('détaille les sous-sections RGPD', () => {
    const rgpd = MENTIONS_LEGALES.sections.find((s) => s.id === 'donnees-personnelles');
    expect(rgpd?.subsections?.length).toBeGreaterThanOrEqual(5);
  });

  it('LIBELLES_ANCRES_MENTIONS aligné sur les sections', () => {
    expect(LIBELLES_ANCRES_MENTIONS).toHaveLength(MENTIONS_LEGALES.sections.length);
  });
});
