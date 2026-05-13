/* ============================================
   Meta partage (OG, canonical) + bonus score pages
   ============================================ */

import { CONFIG } from '../config.js';
import { byId } from '../utils/dom.js';
import { ajouterScore } from './score.js';

export function initMetaPartage() {
  const pageUrl = window.location.href.split('#')[0];
  const canon = byId(CONFIG.SELECTORS.CANONICAL);
  if (canon) canon.href = pageUrl;

  document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach((meta) => {
    const raw = meta.getAttribute('content') || '';
    if (raw && !/^https?:\/\//i.test(raw)) {
      meta.setAttribute('content', new URL(raw, window.location.href).href);
    }
  });

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', pageUrl);
}

export function initBonusScore() {
  const PAGE_KEY = CONFIG.STORAGE.PAGE_PREFIX + window.location.pathname;
  if (!sessionStorage.getItem(PAGE_KEY)) {
    sessionStorage.setItem(PAGE_KEY, '1');
    ajouterScore(200);
  }

  document.querySelectorAll('.carte-projet').forEach((carte) => {
    carte.addEventListener('click', () => ajouterScore(300));
  });

  document.querySelectorAll('.carte-dojo').forEach((carte) => {
    carte.addEventListener('click', () => ajouterScore(150));
  });

  const lienGithub = document.querySelector('.lien-github');
  if (lienGithub) {
    lienGithub.addEventListener('click', () => ajouterScore(500));
  }

  document.querySelectorAll('.carte-projet').forEach((carte) => {
    let dejaSurvole = false;
    carte.addEventListener('mouseenter', () => {
      if (!dejaSurvole) {
        ajouterScore(100);
        dejaSurvole = true;
      }
    });
  });
}
