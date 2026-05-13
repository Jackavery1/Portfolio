/* ============================================
   Modale aperçu projet (WORK)
   ============================================ */

import { CONFIG } from '../config.js';
import { byId, byQsAll } from '../utils/dom.js';
import { trapTabModal } from '../utils/focus.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';

let elementFocusAvantModal = null;

export function ouvrirModal(projetKey) {
  const data = CONFIG.PROJETS[projetKey];
  const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
  const modalTitre = byId(CONFIG.SELECTORS.MODAL_TITRE);
  const modalDesc = byId(CONFIG.SELECTORS.MODAL_DESC);
  const modalTech = byId(CONFIG.SELECTORS.MODAL_TECH);
  const modalImg = byId(CONFIG.SELECTORS.MODAL_IMG);
  const btnFermer = byId(CONFIG.SELECTORS.MODAL_FERMER);
  if (!data || !modalOverlay || !modalTitre || !modalDesc || !modalTech || !modalImg || !btnFermer) return;

  elementFocusAvantModal = document.activeElement;

  modalTitre.textContent = data.titre;
  modalDesc.textContent = data.desc;

  if (typeof IMG !== 'undefined' && IMG[data.img]) {
    modalImg.src = IMG[data.img];
    modalImg.style.display = 'block';
  } else {
    modalImg.style.display = 'none';
  }

  modalTech.innerHTML = '';
  data.tech.forEach((t) => {
    const li = document.createElement('span');
    li.textContent = t;
    li.style.cssText =
      'font-family:var(--police-crt);font-size:1rem;color:var(--couleur-accent);border:1px solid var(--couleur-bordure);padding:.1rem .45rem;letter-spacing:1px;';
    modalTech.appendChild(li);
  });

  modalOverlay.hidden = false;
  jouerBip(440, 60, 'sine');
  ajouterScore(50);
  btnFermer.focus();
}

export function fermerModal() {
  const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
  if (!modalOverlay) return;
  modalOverlay.hidden = true;
  jouerBip(220, 40);
  const prev = elementFocusAvantModal;
  elementFocusAvantModal = null;
  if (prev && typeof prev.focus === 'function') {
    requestAnimationFrame(() => prev.focus());
  }
}

export function initModalClavier() {
  document.addEventListener('keydown', (evt) => {
    const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
    if (!modalOverlay || modalOverlay.hidden) return;
    if (evt.key === 'Escape') {
      evt.preventDefault();
      fermerModal();
      return;
    }
    trapTabModal(evt, modalOverlay);
  });
}

export function initModalClicks() {
  const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
  const btnFermer = byId(CONFIG.SELECTORS.MODAL_FERMER);

  byQsAll('.carte-projet[data-projet]').forEach((carte) => {
    carte.addEventListener('click', () => ouvrirModal(carte.dataset.projet));
    carte.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        ouvrirModal(carte.dataset.projet);
      }
    });
  });

  if (btnFermer) btnFermer.addEventListener('click', fermerModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (evt) => {
      if (evt.target === modalOverlay) fermerModal();
    });
  }
}
