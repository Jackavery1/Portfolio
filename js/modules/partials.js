/* ============================================
   Partials HTML (nav, footer, marquee, CRT, popup)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { getCurrentPageFile } from '../utils/page.js';

function estEnvironnementDev() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    new URLSearchParams(location.search).has('dev')
  );
}

export async function chargerPartials() {
  const aCharger = CONFIG.PARTIALS.filter(({ id }) => byId(id));
  if (aCharger.length === 0) {
    marquerLienActif();
    return;
  }

  await Promise.all(
    aCharger.map(async ({ id, fichier }) => {
      const conteneur = byId(id);
      if (!conteneur) return;
      try {
        const reponse = await fetch(fichier);
        if (!reponse.ok) {
          throw new Error(`HTTP ${reponse.status} — ${fichier}`);
        }
        const html = await reponse.text();
        conteneur.outerHTML = html;
      } catch (err) {
        if (estEnvironnementDev()) {
          console.warn(
            `[partials] Échec chargement ${fichier} (${id}) :`,
            err?.message || err,
          );
        }
      }
    }),
  );
  marquerLienActif();
}

export function marquerLienActif() {
  const page = getCurrentPageFile();
  document.querySelectorAll('.nav__bouton').forEach((lien) => {
    if (lien.getAttribute('href') === page) {
      lien.classList.add('actif');
      lien.setAttribute('aria-current', 'page');
    }
  });
}
