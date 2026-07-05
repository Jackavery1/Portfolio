/* ============================================
   Métadonnées partage (OG, canonical) et bonus score par page
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { obtenirFichierPageCourante } from '../utils/page.js';
import { ajouterScore } from './score.js';

function baseOrigine() {
  if (CONFIGURATION.SITE_ORIGIN) {
    return CONFIGURATION.SITE_ORIGIN.replace(/\/$/, '');
  }
  const path = window.location.pathname.replace(/\/[^/]*$/, '') || '';
  return `${window.location.origin}${path}`.replace(/\/$/, '');
}

function urlAbsolue(cheminRelatif) {
  const raw = String(cheminRelatif || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = baseOrigine();
  const rel = raw.startsWith('/') ? raw.slice(1) : raw;
  return `${base}/${rel}`;
}

function urlPageCourante() {
  const file = obtenirFichierPageCourante();
  if (file === 'index.html' || file === '') {
    return `${baseOrigine()}/`;
  }
  return `${baseOrigine()}/${file}`;
}

export function initialiserMetaPartage() {
  const pageUrl = urlPageCourante();
  const canon = parId(CONFIGURATION.SELECTEURS.CANONICAL);
  if (canon) canon.href = pageUrl;

  const ogUrl = parId(CONFIGURATION.SELECTEURS.OG_URL);
  if (ogUrl) ogUrl.setAttribute('content', pageUrl);

  document
    .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
    .forEach((meta) => {
      const raw = meta.getAttribute('content') || '';
      if (raw && !/^https?:\/\//i.test(raw)) {
        meta.setAttribute('content', urlAbsolue(raw));
      }
    });
}

export function initialiserBonusScore() {
  const PAGE_KEY = CONFIGURATION.STOCKAGE.PREFIXE_PAGE + window.location.pathname;
  try {
    if (!sessionStorage.getItem(PAGE_KEY)) {
      sessionStorage.setItem(PAGE_KEY, '1');
      ajouterScore(CONFIGURATION.BONUS_SCORE.PAGE);
    }
  } catch {
    /* sessionStorage indisponible */
  }

  const lienGithub = document.querySelector('.lien-github');
  if (lienGithub) {
    lienGithub.addEventListener('click', () => ajouterScore(CONFIGURATION.BONUS_SCORE.GITHUB));
  }
}
