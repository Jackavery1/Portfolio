/** Initialiseurs lazy-load par section (data-section-id). Voir sections-manifest.js. */

import { CHARGES_SECTION } from './sections-registry.js';
import { SECTIONS_AVEC_INITIALISEUR } from './sections-manifest.js';

async function executerCharges(charges) {
  for (const { module: chemin, init } of charges) {
    const imported = await import(chemin);
    const noms = Array.isArray(init) ? init : [init];
    for (const nom of noms) {
      const resultat = imported[nom]();
      if (resultat instanceof Promise) await resultat;
    }
  }
}

export const INITIALISEURS_SECTION = Object.fromEntries(
  SECTIONS_AVEC_INITIALISEUR.map((sid) => [sid, () => executerCharges(CHARGES_SECTION[sid] ?? [])])
);

export async function initialiserSection(sid) {
  if (!SECTIONS_AVEC_INITIALISEUR.includes(sid)) return;
  const initialiser = INITIALISEURS_SECTION[sid];
  if (initialiser) await initialiser();
}
