/* ============================================
   Meta partage (OG, canonical) + bonus score pages
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId } from '../utils/dom.js';
import { getCurrentPageFile } from '../utils/page.js';
import { SCORE_BONUS } from '../config/score-bonus.js';
import { ajouterScore } from './score.js';

function baseOrigine() {
  if (CONFIG.SITE_ORIGIN) {
    return CONFIG.SITE_ORIGIN.replace(/\/$/, '');
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
  const file = getCurrentPageFile();
  if (file === 'index.html' || file === '') {
    return `${baseOrigine()}/`;
  }
  return `${baseOrigine()}/${file}`;
}

export function initMetaPartage() {
  const pageUrl = urlPageCourante();
  const canon = byId(CONFIG.SELECTORS.CANONICAL);
  if (canon) canon.href = pageUrl;

  const ogUrl = byId(CONFIG.SELECTORS.OG_URL);
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

export function initBonusScore() {
  const PAGE_KEY = CONFIG.STORAGE.PAGE_PREFIX + window.location.pathname;
  try {
    if (!sessionStorage.getItem(PAGE_KEY)) {
      sessionStorage.setItem(PAGE_KEY, '1');
      ajouterScore(SCORE_BONUS.PAGE);
    }
  } catch {
    /* sessionStorage indisponible */
  }

  const lienGithub = document.querySelector('.lien-github');
  if (lienGithub) {
    lienGithub.addEventListener('click', () => ajouterScore(SCORE_BONUS.GITHUB));
  }
}
