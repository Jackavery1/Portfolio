import { describe, expect, it } from 'vitest';
import { PROJETS, PROJETS_ORDER, PROJECT_ICONS } from './projects.js';

describe('PROJETS', () => {
  it('expose un ordre cohérent avec les clés', () => {
    expect(PROJETS_ORDER.length).toBeGreaterThan(0);
    PROJETS_ORDER.forEach((id) => {
      expect(PROJETS[id]).toBeDefined();
      expect(PROJECT_ICONS[id]).toBeTruthy();
    });
    expect(Object.keys(PROJETS).sort()).toEqual([...PROJETS_ORDER].sort());
  });

  it('définit les champs carte et modale pour chaque projet', () => {
    PROJETS_ORDER.forEach((id) => {
      const p = PROJETS[id];
      expect(p.titre).toBeTruthy();
      expect(p.desc).toBeTruthy();
      expect(p.descCarte).toBeTruthy();
      expect(p.num).toMatch(/^(PRJ|STG)-\d+$/);
      expect(p.etoiles).toBeGreaterThanOrEqual(1);
      expect(p.completion).toBeGreaterThanOrEqual(0);
      expect(p.tech?.length).toBeGreaterThan(0);
      expect(p.apercu).toMatch(/^assets\/previews\/.+\.png$/);
      expect(p.lien).toMatch(/^https:\/\//);
    });
  });
});
