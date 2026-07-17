/* ============================================
   Animations barres (completion, stats, langues)
   ============================================ */

import { prefereMouvementReduit } from '../utils/mouvement-reduit.js';

const sectionsAnimees = new Set();

export function animerBarresSection(id) {
  if (sectionsAnimees.has(id)) return;
  sectionsAnimees.add(id);
  const section = document.getElementById(id);
  if (!section) return;

  const selecteurs = [
    '.barre-completion__fill',
    '.score-barre',
    '.langue-item__barre',
    '.boss-carte__vie-fill',
  ];

  const sansAnimation = prefereMouvementReduit();

  selecteurs.forEach((sel) => {
    section.querySelectorAll(sel).forEach((barre) => {
      const cible = barre.style.getPropertyValue('--cible') || '0%';
      if (sansAnimation) {
        barre.style.width = cible;
        return;
      }
      /* CSS width: var(--cible) reste visible tant qu’aucun inline 0% n’est posé.
         On anime ensuite, avec filet de sécurité si le 2e rAF est sauté. */
      const appliquerCible = () => {
        barre.style.width = cible;
      };
      requestAnimationFrame(() => {
        barre.style.width = '0%';
        requestAnimationFrame(appliquerCible);
      });
      setTimeout(appliquerCible, 120);
    });
  });
}
