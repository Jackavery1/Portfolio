/* ============================================
   Accueil — liens sociaux (LinkedIn optionnel)
   ============================================ */

import { CONFIGURATION } from '../config/index.js';

export function initialiserAccueilSocial() {
  const url = CONFIGURATION.SOCIAL?.LINKEDIN?.trim();
  const lien = document.getElementById('js-lien-linkedin');
  if (!lien || !url) return;

  lien.href = url;
  lien.hidden = false;
}
