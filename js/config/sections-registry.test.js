import { describe, expect, it } from 'vitest';
import { CHARGES_SECTION } from './sections-registry.js';
import { SECTIONS_AVEC_INITIALISEUR } from './sections-manifest.js';

describe('CHARGES_SECTION', () => {
  it('couvre exactement les sections lazy-load du manifeste', () => {
    expect(Object.keys(CHARGES_SECTION).sort()).toEqual([...SECTIONS_AVEC_INITIALISEUR].sort());
  });

  it('référence des modules sous js/modules/', () => {
    Object.values(CHARGES_SECTION).forEach((charges) => {
      charges.forEach(({ module, init }) => {
        expect(module).toMatch(/^\.\.\/modules\/.+\.js$/);
        const noms = Array.isArray(init) ? init : [init];
        noms.forEach((nom) => {
          expect(nom).toMatch(/^initialiser[A-Z]/);
        });
      });
    });
  });

  it('déclare les charges attendues pour projets et dojo', () => {
    expect(CHARGES_SECTION.projets).toHaveLength(2);
    expect(CHARGES_SECTION.projets[0].init).toBe('initialiserGrilleProjets');
    expect(CHARGES_SECTION.dojo[0]).toEqual({
      module: '../modules/dojo-boss.js',
      init: 'initialiserDojoBoss',
    });
  });
});
