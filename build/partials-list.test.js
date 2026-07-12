import { describe, expect, it } from 'vitest';
import { PARTIELS } from './partials-list.mjs';

describe('partials-list', () => {
  it('expose des partials avec id et fichier', () => {
    expect(PARTIELS.length).toBeGreaterThan(5);
    PARTIELS.forEach((p) => {
      expect(p.id).toMatch(/^partial-/);
      expect(p.fichier).toMatch(/^partials\//);
    });
  });
});
