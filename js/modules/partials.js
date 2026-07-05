/* ============================================
   Partials HTML (nav, footer, marquee, CRT, popup)
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { obtenirFichierPageCourante } from '../utils/page.js';

const FALLBACKS_PARTIELS = {
  'partial-nav':
    '<nav class="nav nav--fallback" role="navigation" aria-label="Navigation principale"><p class="nav__fallback" role="alert">Navigation indisponible — rechargez la page ou vérifiez votre connexion.</p><button type="button" class="nav__fallback-retry">Réessayer</button></nav>',
  'partial-footer':
    '<footer class="pied-page pied-page--fallback" role="contentinfo"><p role="alert">Pied de page indisponible.</p><button type="button" class="nav__fallback-retry">Réessayer</button></footer>',
};

function estEnvironnementDev() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    new URLSearchParams(location.search).has('dev')
  );
}

function estProtocoleFichier() {
  return location.protocol === 'file:';
}

function appliquerFallbackPartial(conteneur, id) {
  const html = FALLBACKS_PARTIELS[id];
  if (html) {
    conteneur.outerHTML = html;
    document.querySelectorAll('.nav__fallback-retry').forEach((btn) => {
      btn.addEventListener('click', () => location.reload());
    });
    return;
  }
  conteneur.innerHTML = `<p role="alert">Contenu indisponible (${id}).</p>`;
}

function marquerLienActif() {
  const page = obtenirFichierPageCourante();
  document.querySelectorAll('.nav__bouton').forEach((lien) => {
    if (lien.getAttribute('href') === page) {
      lien.classList.add('actif');
      lien.setAttribute('aria-current', 'page');
    }
  });
}

export async function chargerPartiels() {
  const aCharger = CONFIGURATION.PARTIELS.filter(({ id }) => parId(id));
  if (aCharger.length === 0) {
    marquerLienActif();
    return;
  }

  if (estProtocoleFichier()) {
    aCharger.forEach(({ id }) => {
      const conteneur = parId(id);
      if (conteneur) appliquerFallbackPartial(conteneur, id);
    });
    marquerLienActif();
    return;
  }

  await Promise.all(
    aCharger.map(async ({ id, fichier }) => {
      const conteneur = parId(id);
      if (!conteneur) return;
      try {
        const reponse = await fetch(fichier);
        if (!reponse.ok) {
          throw new Error(`HTTP ${reponse.status} — ${fichier}`);
        }
        const html = await reponse.text();
        conteneur.outerHTML = html;
      } catch (err) {
        console.error(`[partials] Échec chargement ${fichier} (${id}) :`, err?.message || err);
        if (estEnvironnementDev()) {
          console.warn('[partials] Vérifiez le serveur statique et les chemins partials/');
        }
        const encoreLa = parId(id);
        if (encoreLa) appliquerFallbackPartial(encoreLa, id);
      }
    })
  );
  marquerLienActif();
}
