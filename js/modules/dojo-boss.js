/* ============================================
   Dojo — boss rush (citations, victoire, barres HP)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { SCORE_BONUS } from '../config/score-bonus.js';
import { jouerFanfareVictoire } from './audio.js';
import { ajouterScore } from './score.js';

const CITATIONS = {
  domslayer: '⚔️ « Mauvais sélecteur ? Recommence. »',
  crud: '⚔️ « Créer, lire, modifier… supprimer si tu insistes. »',
  ejs: "⚔️ « Tes données passent par moi avant l'écran. »",
  poo: '⚔️ « Ma classe mère te salue. »',
  selenium: "⚔️ « J'ai cliqué avant toi. Test validé. »",
  rentercar: "⚔️ « Trie par prix — mais pas à l'envers. »",
  oracle: "⚔️ « J'ai déjà joint toutes les tables. »",
  stack: '⚔️ « Du HTML au serveur : toute la chaîne. »',
  angular: '⚡ « Encore un module… on y est presque. »',
  java: '⚡ « Première compile… on croise les doigts. »',
  react: '🔒 « Pas encore. Ce boss dort encore. »',
};

function labelBoss(carte) {
  const nom = carte.querySelector('.boss-carte__nom')?.textContent?.trim();
  const statut = carte.querySelector('.boss-carte__statut')?.textContent?.trim();
  return [nom, statut].filter(Boolean).join(' — ');
}

function initCitations() {
  document.querySelectorAll('.boss-carte[data-boss]').forEach((carte) => {
    const key = carte.dataset.boss;
    const texte = CITATIONS[key];
    if (!texte) return;

    carte.style.position = 'relative';
    if (!carte.hasAttribute('tabindex')) carte.setAttribute('tabindex', '0');

    const bulleId = `boss-citation-${key}`;
    const bulle = document.createElement('div');
    bulle.id = bulleId;
    bulle.className = 'boss-citation';
    bulle.textContent = texte;
    carte.setAttribute('aria-describedby', bulleId);
    carte.appendChild(bulle);

    const afficher = () => bulle.classList.add('boss-citation--visible');
    const masquer = () => bulle.classList.remove('boss-citation--visible');
    const pointerGrossier = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    carte.addEventListener('mouseenter', afficher);
    carte.addEventListener('mouseleave', masquer);
    carte.addEventListener('focusin', () => {
      afficher();
      carte.classList.add('boss-carte--focus-citation');
    });
    carte.addEventListener('focusout', () => {
      masquer();
      carte.classList.remove('boss-carte--focus-citation');
    });

    if (pointerGrossier) {
      carte.addEventListener('click', (evt) => {
        if (carte.classList.contains('boss-carte--vaincu')) return;

        const dejaVisible = bulle.classList.contains('boss-citation--visible');
        document.querySelectorAll('.boss-citation--visible').forEach((node) => {
          node.classList.remove('boss-citation--visible');
        });
        document.querySelectorAll('.boss-carte--focus-citation').forEach((node) => {
          node.classList.remove('boss-carte--focus-citation');
        });

        if (!dejaVisible) {
          bulle.classList.add('boss-citation--visible');
          carte.classList.add('boss-carte--focus-citation');
        }

        evt.stopPropagation();
      });
    }
  });
}

function initVictoireClavier() {
  document.querySelectorAll('.boss-carte--vaincu[data-boss]').forEach((carte) => {
    carte.setAttribute('tabindex', '0');
    carte.setAttribute('role', 'button');
    carte.setAttribute('aria-label', `${labelBoss(carte)}. Appuyer pour rejouer la victoire.`);

    const celebrer = () => {
      if (carte.classList.contains('boss-flash')) return;
      carte.classList.add('boss-flash');
      jouerFanfareVictoire();
      setTimeout(() => carte.classList.remove('boss-flash'), 600);
    };

    carte.addEventListener('click', celebrer);
    carte.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        celebrer();
      }
    });
  });
}

function initBarresHp() {
  const intervalIds = [];

  document.querySelectorAll('.boss-carte--en-cours .boss-carte__vie-fill').forEach((fill) => {
    const raw = fill.style.getPropertyValue('--cible') || '50%';
    const base = parseFloat(raw) || 50;

    const id = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 3;
      fill.style.width = `${Math.max(2, base + jitter)}%`;
    }, 800);
    intervalIds.push(id);
  });

  if (intervalIds.length) {
    window.addEventListener('pagehide', () => intervalIds.forEach((id) => clearInterval(id)), {
      once: true,
    });
  }
}

function initScoreBoss() {
  const { DOJO_BOSS_PREFIX } = CONFIG.STORAGE;

  document.querySelectorAll('.boss-carte[data-boss]').forEach((carte) => {
    carte.addEventListener('click', () => {
      const storageKey = DOJO_BOSS_PREFIX + carte.dataset.boss;
      try {
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, '1');
      } catch {
        /* sessionStorage indisponible */
      }

      const pts = carte.classList.contains('boss-carte--vaincu')
        ? SCORE_BONUS.DOJO_BOSS_VAINCU
        : SCORE_BONUS.DOJO_BOSS;
      ajouterScore(pts);
    });
  });
}

export function initDojoBoss() {
  if (!document.getElementById('dojo')) return;
  initCitations();
  initVictoireClavier();
  initBarresHp();
  initScoreBoss();
}
