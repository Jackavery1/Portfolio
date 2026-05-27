/* ============================================
   Modale aperçu projet (WORK)
   ============================================ */

import { CONFIG } from "../config.js";
import { byId, byQsAll } from "../utils/dom.js";
import { trapTabModal } from "../utils/focus.js";
import { jouerBip } from "./audio.js";
import { ajouterScore } from "./score.js";

let elementFocusAvantModal = null;

function resolveApercuSrc(data) {
  return data.apercu || null;
}

function estImageRaster(src) {
  return /\.(png|jpe?g)$/i.test(src || "");
}

function preparerImageModale(modalImg, src, titre) {
  modalImg.loading = "lazy";
  modalImg.decoding = "async";
  modalImg.alt = `Aperçu — ${titre}`;

  const parent = modalImg.parentElement;
  let picture =
    parent?.tagName === "PICTURE" ? parent : null;

  if (!src || !estImageRaster(src)) {
    if (picture) {
      picture.replaceWith(modalImg);
    }
    modalImg.classList.toggle("modal-img--svg", /\.svg($|\?)/i.test(src || ""));
    return;
  }

  if (!picture) {
    picture = document.createElement("picture");
    modalImg.parentNode.insertBefore(picture, modalImg);
    picture.appendChild(modalImg);
  }

  let source = picture.querySelector("source[type='image/webp']");
  if (!source) {
    source = document.createElement("source");
    source.type = "image/webp";
    picture.insertBefore(source, modalImg);
  }
  source.srcset = src.replace(/\.(png|jpe?g)$/i, ".webp");

  modalImg.src = src;
  modalImg.classList.remove("modal-img--svg");
}

function remplirLiensModale(modalLien, data) {
  const liens = [];
  if (data.lienDemo) {
    liens.push({ href: data.lienDemo, label: data.lienDemoLabel || "▶ Voir la démo" });
  }
  if (data.lien) {
    liens.push({
      href: data.lien,
      label: data.lienLabel || "▶ Voir le dépôt GitHub",
    });
  }

  if (!liens.length) {
    modalLien.hidden = true;
    modalLien.innerHTML = "";
    return;
  }

  modalLien.hidden = false;
  modalLien.innerHTML = "";
  liens.forEach(({ href, label }) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
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
    modalLien = document.createElement("p");
    modalLien.id = CONFIG.SELECTORS.MODAL_LIEN;
    modalLien.className = "modal-lien";
    modalDesc.insertAdjacentElement("afterend", modalLien);
  }
  remplirLiensModale(modalLien, data);

  const srcApercu = resolveApercuSrc(data);
  if (srcApercu) {
    preparerImageModale(modalImg, srcApercu, data.titre);
    modalImg.hidden = false;
  } else {
    preparerImageModale(modalImg, "", data.titre);
    modalImg.removeAttribute("src");
    modalImg.hidden = true;
  }

  modalTech.innerHTML = "";
  data.tech.forEach((t) => {
    const li = document.createElement("span");
    li.className = "modal-tech-tag";
    li.textContent = t;
    modalTech.appendChild(li);
  });

  modalOverlay.hidden = false;
  jouerBip(440, 60, "sine");
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
  if (prev && typeof prev.focus === "function") {
    requestAnimationFrame(() => prev.focus());
  }
}

export function initModalClavier() {
  document.addEventListener("keydown", (evt) => {
    const modalOverlay = byId(CONFIG.SELECTORS.MODAL);
    if (!modalOverlay || modalOverlay.hidden) return;
    if (evt.key === "Escape") {
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

  byQsAll(".carte-projet[data-projet]").forEach((carte) => {
    carte.addEventListener("click", () => ouvrirModal(carte.dataset.projet));
    carte.addEventListener("keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        ouvrirModal(carte.dataset.projet);
      }
    });
  });

  if (btnFermer) btnFermer.addEventListener("click", fermerModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (evt) => {
      if (evt.target === modalOverlay) fermerModal();
    });
  }
}
