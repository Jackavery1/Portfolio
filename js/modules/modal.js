/* ============================================
   Modale aperçu projet
   ============================================ */

import { CONFIGURATION } from '../config/index.js';
import { PROJETS } from '../config/projects.js';
import { parId, tousParSelecteur } from '../utils/dom.js';
import { piegerTabulationModale } from '../utils/focus.js';
import { basculerInertFond } from '../utils/inert.js';
import {
  cheminWebpDepuisRaster,
  estImageRaster,
  liensProjetValides,
  resoudreSrcApercu,
} from '../utils/modal-helpers.js';
import { jouerBip } from './audio.js';
import { accorderBonusProjet } from './score.js';

let elementFocusAvantModal = null;

function detacherBalisePicture(img) {
  const picture = img.closest('picture');
  if (!picture?.parentElement) return;
  picture.parentElement.insertBefore(img, picture);
  picture.remove();
}

function preparerImageModale(modalImg, src, titre) {
  detacherBalisePicture(modalImg);

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

function remplirLiensModale(modalLien, projet) {
  const liensValides = liensProjetValides(projet);

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
  const projet = PROJETS[projetKey];
  const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
  const modalTitre = parId(CONFIGURATION.SELECTEURS.MODALE_TITRE);
  const modalDesc = parId(CONFIGURATION.SELECTEURS.MODALE_DESC);
  const modalTech = parId(CONFIGURATION.SELECTEURS.MODALE_TECH);
  const modalImg = parId(CONFIGURATION.SELECTEURS.MODALE_IMG);
  const btnFermer = parId(CONFIGURATION.SELECTEURS.MODALE_FERMER);
  if (
    !projet ||
    !modalOverlay ||
    !modalTitre ||
    !modalDesc ||
    !modalTech ||
    !modalImg ||
    !btnFermer
  )
    return;

  elementFocusAvantModal = document.activeElement;

  modalTitre.textContent = projet.titre;
  modalDesc.textContent = projet.desc;

  let modalLien = parId(CONFIGURATION.SELECTEURS.MODALE_LIEN);
  if (!modalLien) {
    modalLien = document.createElement('p');
    modalLien.id = CONFIGURATION.SELECTEURS.MODALE_LIEN;
    modalLien.className = 'modal-lien';
    modalDesc.insertAdjacentElement('afterend', modalLien);
  }
  remplirLiensModale(modalLien, projet);

  const srcApercu = resoudreSrcApercu(projet);
  if (srcApercu) {
    preparerImageModale(modalImg, srcApercu, projet.titre);
    modalImg.hidden = false;
  } else {
    preparerImageModale(modalImg, '', projet.titre);
    modalImg.removeAttribute('src');
    modalImg.hidden = true;
  }

  modalTech.innerHTML = '';
  projet.tech.forEach((t) => {
    const li = document.createElement('span');
    li.className = 'modal-tech-tag';
    li.textContent = t;
    modalTech.appendChild(li);
  });

  modalOverlay.hidden = false;
  basculerInertFond(true, modalOverlay);
  jouerBip(440, 60, 'sine');
  btnFermer.focus();
}

export function fermerModal() {
  const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
  if (!modalOverlay) return;
  modalOverlay.hidden = true;
  basculerInertFond(false);
  jouerBip(220, 40);
  const prev = elementFocusAvantModal;
  elementFocusAvantModal = null;
  if (prev && typeof prev.focus === 'function') {
    requestAnimationFrame(() => prev.focus());
  }
}

export function initialiserClavierModale() {
  document.addEventListener('keydown', (evt) => {
    const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
    if (!modalOverlay || modalOverlay.hidden) return;
    if (evt.key === 'Escape') {
      evt.preventDefault();
      fermerModal();
      return;
    }
    piegerTabulationModale(evt, modalOverlay);
  });
}

export function initialiserClicsModale() {
  const modalOverlay = parId(CONFIGURATION.SELECTEURS.MODALE);
  const btnFermer = parId(CONFIGURATION.SELECTEURS.MODALE_FERMER);

  tousParSelecteur('.carte-projet[data-projet]').forEach((carte) => {
    carte.addEventListener('click', () => {
      const id = carte.dataset.projet;
      accorderBonusProjet(id);
      ouvrirModal(id);
    });
  });

  if (btnFermer) btnFermer.addEventListener('click', fermerModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (evt) => {
      if (evt.target === modalOverlay) fermerModal();
    });
  }
}
