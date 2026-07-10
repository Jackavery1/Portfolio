import { describe, expect, it, vi } from 'vitest';
import { INITIALISEURS_SECTION, initialiserSection } from './sections.js';

describe('sections', () => {
  it('expose un initialiseur pour chaque section lazy-load', () => {
    expect(Object.keys(INITIALISEURS_SECTION).sort()).toEqual([
      'accueil',
      'contact',
      'dojo',
      'mentions',
      'projets',
    ]);
  });

  it('ignore les sections sans initialiseur', async () => {
    await expect(initialiserSection('parcours')).resolves.toBeUndefined();
  });

  it('délègue au handler enregistré', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const original = INITIALISEURS_SECTION.accueil;
    INITIALISEURS_SECTION.accueil = handler;
    await initialiserSection('accueil');
    expect(handler).toHaveBeenCalled();
    INITIALISEURS_SECTION.accueil = original;
  });
});
