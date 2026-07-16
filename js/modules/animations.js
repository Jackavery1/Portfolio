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
      barre.style.width = '0%';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          barre.style.width = cible;
        })
      );
    });
  });
}
