/* ============================================
   Partials HTML (nav, footer, marquee, CRT, popup)
   ============================================ */

import { CONFIG } from '../config.js';
import { byId } from '../utils/dom.js';

export async function chargerPartials() {
  await Promise.all(
    CONFIG.PARTIALS.map(async ({ id, fichier }) => {
      const conteneur = byId(id);
      if (!conteneur) return;
      try {
        const reponse = await fetch(fichier);
        const html = await reponse.text();
        conteneur.outerHTML = html;
      } catch (e) {
        console.warn(`Partial non chargé : ${fichier}`, e);
      }
    })
  );
  marquerLienActif();
}

export function marquerLienActif() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__bouton').forEach((lien) => {
    if (lien.getAttribute('href') === page) {
      lien.classList.add('actif');
      lien.setAttribute('aria-current', 'page');
    }
  });
}
