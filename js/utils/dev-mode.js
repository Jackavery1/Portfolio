/** Détection build prod vs dev local (CSP injectée au build). */

import { STOCKAGE } from '../config/storage.js';

export function estBuildProd() {
  return Boolean(document.querySelector('meta[http-equiv="Content-Security-Policy"]'));
}

export function estEnvironnementDevLocal() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    new URLSearchParams(location.search).has('dev')
  );
}

function bandeauDevMasque() {
  try {
    return sessionStorage.getItem(STOCKAGE.BANDEAU_DEV_MASQUE) === '1';
  } catch {
    return false;
  }
}

function masquerBandeauDev(bandeau) {
  try {
    sessionStorage.setItem(STOCKAGE.BANDEAU_DEV_MASQUE, '1');
  } catch {
    /* sessionStorage indisponible */
  }
  bandeau.remove();
}

export function afficherBandeauDev() {
  if (
    estBuildProd() ||
    !estEnvironnementDevLocal() ||
    bandeauDevMasque() ||
    document.getElementById('js-dev-banner')
  ) {
    return;
  }

  const bandeau = document.createElement('div');
  bandeau.id = 'js-dev-banner';
  bandeau.className = 'dev-banner';
  bandeau.setAttribute('role', 'status');
  bandeau.innerHTML = `
    <p class="dev-banner__texte">Mode dev — PWA / hors ligne : npm run build && npm run start:prod</p>
    <button type="button" class="dev-banner__fermer" aria-label="Masquer ce message pour la session">×</button>
  `;
  bandeau.querySelector('.dev-banner__fermer').addEventListener('click', () => {
    masquerBandeauDev(bandeau);
  });
  document.body.prepend(bandeau);
}
