/* ============================================
   Dojo — boss rush (citations, victoire, barres HP)
   ============================================ */

import { parId } from '../utils/dom.js';
import { jouerFanfareVictoire } from './audio.js';
import { accorderBonusDojoBoss } from './score.js';

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

function initialiserCitations() {
  document.querySelectorAll('.boss-carte[data-boss]').forEach((carte) => {
    const identifiantBoss = carte.dataset.boss;
    const texte = CITATIONS[identifiantBoss];
    if (!texte) return;

    carte.style.position = 'relative';
    if (!carte.hasAttribute('tabindex')) carte.setAttribute('tabindex', '0');

    const bulleId = `boss-citation-${identifiantBoss}`;
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

function initialiserVictoireClavier() {
  document.querySelectorAll('.boss-carte--vaincu[data-boss]').forEach((carte) => {
    carte.setAttribute('tabindex', '0');
    carte.setAttribute('role', 'button');

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

function initialiserBarresPv() {
  const intervalIds = [];

  document.querySelectorAll('.boss-carte--en-cours .boss-carte__vie-fill').forEach((fill) => {
    const raw = fill.style.getPropertyValue('--cible') || '50%';
    const base = parseFloat(raw) || 50;

    const id = setInterval(() => {
      const ecart = (Math.random() - 0.5) * 3;
      fill.style.width = `${Math.max(2, base + ecart)}%`;
    }, 800);
    intervalIds.push(id);
  });

  if (intervalIds.length) {
    window.addEventListener('pagehide', () => intervalIds.forEach((id) => clearInterval(id)), {
      once: true,
    });
  }
}

function initialiserScoreBoss() {
  document.querySelectorAll('.boss-carte[data-boss]').forEach((carte) => {
    const bossId = carte.dataset.boss;
    const vaincu = carte.classList.contains('boss-carte--vaincu');

    carte.addEventListener('click', () => {
      accorderBonusDojoBoss(bossId, vaincu);
    });
  });
}

export function initialiserDojoBoss() {
  if (!parId('dojo')) return;
  initialiserCitations();
  initialiserVictoireClavier();
  initialiserBarresPv();
  initialiserScoreBoss();
}
