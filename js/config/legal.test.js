import { describe, expect, it } from 'vitest';
import { LEGAL, LEGAL_ANCHOR_LABELS } from './legal.js';

describe('legal config', () => {
  it('expose les ancres attendues par le footer', () => {
    const ids = LEGAL.sections.map((s) => s.id);
    expect(ids).toContain('propriete-intellectuelle');
    expect(ids).toContain('donnees-personnelles');
    expect(ids).toContain('cookies-traceurs');
  });

  it('détaille les sous-sections RGPD', () => {
    const rgpd = LEGAL.sections.find((s) => s.id === 'donnees-personnelles');
    expect(rgpd?.subsections?.length).toBeGreaterThanOrEqual(5);
  });

  it('LEGAL_ANCHOR_LABELS aligné sur les sections', () => {
    expect(LEGAL_ANCHOR_LABELS).toHaveLength(LEGAL.sections.length);
  });
});
