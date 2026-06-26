/* ============================================
   Accueil — liens sociaux (LinkedIn optionnel)
   ============================================ */

import { CONFIG } from '../config/index.js';

export function initAccueilSocial() {
  const url = CONFIG.SOCIAL?.LINKEDIN?.trim();
  const lien = document.getElementById('js-lien-linkedin');
  if (!lien || !url) return;

  lien.href = url;
  lien.hidden = false;
}
