/* ============================================
   Animations barres (completion, stats, langues)
   ============================================ */

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

  selecteurs.forEach((sel) => {
    section.querySelectorAll(sel).forEach((barre) => {
      const cible = barre.style.getPropertyValue('--cible') || '0%';
      barre.style.width = '0%';
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          barre.style.width = cible;
        })
      );
    });
  });
}
