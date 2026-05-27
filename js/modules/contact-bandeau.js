/* ============================================
   Bandeau contact : disponibilité ↔ téléchargement CV
   ============================================ */

import { CONFIG } from "../config.js";
import { byId } from "../utils/dom.js";
import { jouerBip } from "./audio.js";

export function initContactBandeau() {
  const zone = byId(CONFIG.SELECTORS.CONTACT_BANDEAU);
  const dispo = byId(CONFIG.SELECTORS.CONTACT_BANDEAU_DISPO);
  const cv = byId(CONFIG.SELECTORS.CONTACT_BANDEAU_CV);
  if (!zone || !dispo || !cv) return;

  cv.href = CONFIG.CONTACT.CV_HREF;
  cv.download = CONFIG.CONTACT.CV_DOWNLOAD;

  let mode = "dispo";

  const majAffichage = () => {
    const surCv = mode === "cv";
    dispo.hidden = surCv;
    cv.hidden = !surCv;
    zone.setAttribute(
      "aria-label",
      surCv
        ? "Télécharger le CV au format PDF. Cliquer pour revenir au statut de disponibilité."
        : "Disponible pour un premier poste développeur web. Cliquer pour afficher le téléchargement du CV.",
    );
  };

  const basculer = () => {
    mode = mode === "dispo" ? "cv" : "dispo";
    majAffichage();
    jouerBip(mode === "cv" ? 523 : 392, 50, "square");
  };

  cv.addEventListener("click", (evt) => evt.stopPropagation());

  zone.addEventListener("click", () => basculer());

  zone.addEventListener("keydown", (evt) => {
    if (evt.key !== "Enter" && evt.key !== " ") return;
    if (mode === "cv" && evt.target === cv) return;
    evt.preventDefault();
    basculer();
  });

  majAffichage();
}
