/* ============================================
   Partials HTML (nav, footer, marquee, CRT, popup)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { getCurrentPageFile } from '../utils/page.js';

const FALLBACKS_PARTIELS = {
  'partial-nav':
    '<nav class="nav nav--fallback" role="navigation" aria-label="Navigation principale"><p class="nav__fallback" role="alert">Navigation indisponible — rechargez la page ou vérifiez votre connexion.</p></nav>',
  'partial-footer':
    '<footer class="pied-page pied-page--fallback" role="contentinfo"><p role="alert">Pied de page indisponible.</p></footer>',
};

function estEnvironnementDev() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    new URLSearchParams(location.search).has('dev')
  );
}

function appliquerFallbackPartial(conteneur, id) {
  const html = FALLBACKS_PARTIELS[id];
  if (html) {
    conteneur.outerHTML = html;
    return;
  }
  conteneur.innerHTML = `<p role="alert">Contenu indisponible (${id}).</p>`;
}

export { FALLBACKS_PARTIELS, appliquerFallbackPartial };

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
        console.error(
          `[partials] Échec chargement ${fichier} (${id}) :`,
          err?.message || err,
        );
        if (estEnvironnementDev()) {
          console.warn('[partials] Vérifiez le serveur statique et les chemins partials/');
        }
        const encoreLa = byId(id);
        if (encoreLa) appliquerFallbackPartial(encoreLa, id);
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
