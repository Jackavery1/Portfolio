/* ============================================
   Modale aperçu projet (WORK)
   ============================================ */

import { CONFIG } from '../config/index.js';
import { byId, byQsAll } from '../utils/dom.js';
import { trapTabModal } from '../utils/focus.js';
import {
  cheminWebpDepuisRaster,
  estImageRaster,
  liensProjetValides,
  resolveApercuSrc,
} from '../utils/modal-helpers.js';
import { jouerBip } from './audio.js';
import { ajouterScore } from './score.js';

let elementFocusAvantModal = null;

function detachPicture(img) {
  const picture = img.closest('picture');
  if (!picture?.parentElement) return;
  picture.parentElement.insertBefore(img, picture);
  picture.remove();
}

function preparerImageModale(modalImg, src, titre) {
  detachPicture(modalImg);

  modalImg.loading = 'eager';
  modalImg.decoding = 'async';
  modalImg.alt = `Aperçu — ${titre}`;

  if (!src) {
    modalImg.removeAttribute('src');
    modalImg.classList.remove('modal-img--svg');
    return;
  }

  const estSvg = /\.svg($|\?)/i.test(src);
  modalImg.classList.toggle('modal-img--svg', estSvg);

  if (estImageRaster(src)) {
    modalImg.classList.remove('modal-img--svg');
    const webp = cheminWebpDepuisRaster(src);
    modalImg.src = src;
    if (webp) {
      const parent = modalImg.parentElement;
      const picture = document.createElement('picture');
      const source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset = webp;
      picture.append(source, modalImg);
      parent?.appendChild(picture);
    }
    return;
  }

  modalImg.src = src;
}

function remplirLiensModale(modalLien, data) {
  const liensValides = liensProjetValides(data);

  if (!liensValides.length) {
    modalLien.hidden = true;
    modalLien.innerHTML = '';
    return;
  }

  modalLien.hidden = false;
  modalLien.innerHTML = '';
  liensValides.forEach(({ href, label }) => {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    modalLien.append(a);
  });
}

export function ouvrirModal(projetKey) {
  const data = CONFIG.PROJETS[projetKey];
  const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
  const modalTitre = byId(CONFIG.SELECTORS.MODAL_TITRE);
  const modalDesc = byId(CONFIG.SELECTORS.MODAL_DESC);
  const modalTech = byId(CONFIG.SELECTORS.MODAL_TECH);
  const modalImg = byId(CONFIG.SELECTORS.MODAL_IMG);
  const btnFermer = byId(CONFIG.SELECTORS.MODAL_FERMER);
  if (
    !data ||
    !modalOverlay ||
    !modalTitre ||
    !modalDesc ||
    !modalTech ||
    !modalImg ||
    !btnFermer
  )
    return;

  elementFocusAvantModal = document.activeElement;

  modalTitre.textContent = data.titre;
  modalDesc.textContent = data.desc;

  let modalLien = byId(CONFIG.SELECTORS.MODAL_LIEN);
  if (!modalLien) {
    modalLien = document.createElement('p');
    modalLien.id = CONFIG.SELECTORS.MODAL_LIEN;
    modalLien.className = 'modal-lien';
    modalDesc.insertAdjacentElement('afterend', modalLien);
  }
  remplirLiensModale(modalLien, data);

  const srcApercu = resolveApercuSrc(data);
  if (srcApercu) {
    preparerImageModale(modalImg, srcApercu, data.titre);
    modalImg.hidden = false;
  } else {
    preparerImageModale(modalImg, '', data.titre);
    modalImg.removeAttribute('src');
    modalImg.hidden = true;
  }

  modalTech.innerHTML = '';
  data.tech.forEach((t) => {
    const li = document.createElement('span');
    li.className = 'modal-tech-tag';
    li.textContent = t;
    modalTech.appendChild(li);
  });

  modalOverlay.hidden = false;
  jouerBip(440, 60, 'sine');
  ajouterScore(350);
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
  });

  if (btnFermer) btnFermer.addEventListener('click', fermerModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (evt) => {
      if (evt.target === modalOverlay) fermerModal();
    });
  }
}
