/* ============================================
   Dojo — boss rush (citations, victoire, barres HP)
   ============================================ */

import { jouerBip } from "./audio.js";

const CITATIONS = {
  domslayer: "⚔️ « Mauvais sélecteur ? Recommence. »",
  crud: "⚔️ « Créer, lire, modifier… supprimer si tu insistes. »",
  ejs: "⚔️ « Tes données passent par moi avant l'écran. »",
  poo: "⚔️ « Ma classe mère te salue. »",
  selenium: "⚔️ « J'ai cliqué avant toi. Test validé. »",
  rentercar: "⚔️ « Trie par prix — mais pas à l'envers. »",
  oracle: "⚔️ « J'ai déjà joint toutes les tables. »",
  stack: "⚔️ « Du HTML au serveur : toute la chaîne. »",
  angular: "⚡ « Encore un module… on y est presque. »",
  java: "⚡ « Première compile… on croise les doigts. »",
  react: "🔒 « Pas encore. Ce boss dort encore. »",
};

function jouerFanfareVictoire() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => jouerBip(freq, 120, "square"), i * 100);
  });
}

function labelBoss(carte) {
  const nom = carte.querySelector(".boss-carte__nom")?.textContent?.trim();
  const statut = carte.querySelector(".boss-carte__statut")?.textContent?.trim();
  return [nom, statut].filter(Boolean).join(" — ");
}

function initCitations() {
  document.querySelectorAll(".boss-carte[data-boss]").forEach((carte) => {
    const key = carte.dataset.boss;
    const texte = CITATIONS[key];
    if (!texte) return;

    carte.style.position = "relative";
    if (!carte.hasAttribute("tabindex")) carte.setAttribute("tabindex", "0");

    const bulle = document.createElement("div");
    bulle.className = "boss-citation";
    bulle.textContent = texte;
    bulle.setAttribute("aria-hidden", "true");
    carte.appendChild(bulle);

    const afficher = () => bulle.classList.add("boss-citation--visible");
    const masquer = () => bulle.classList.remove("boss-citation--visible");

    carte.addEventListener("mouseenter", afficher);
    carte.addEventListener("mouseleave", masquer);
    carte.addEventListener("focusin", afficher);
    carte.addEventListener("focusout", masquer);
  });
}

function initVictoireClavier() {
  document
    .querySelectorAll(".boss-carte--vaincu[data-boss]")
    .forEach((carte) => {
      carte.setAttribute("tabindex", "0");
      carte.setAttribute("role", "button");
      carte.setAttribute(
        "aria-label",
        `${labelBoss(carte)}. Appuyer pour rejouer la victoire.`,
      );

      const celebrer = () => {
        if (carte.classList.contains("boss-flash")) return;
        carte.classList.add("boss-flash");
        jouerFanfareVictoire();
        setTimeout(() => carte.classList.remove("boss-flash"), 600);
      };

      carte.addEventListener("click", celebrer);
      carte.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          celebrer();
        }
      });
    });
}

function initBarresHp() {
  document
    .querySelectorAll(".boss-carte--en-cours .boss-carte__vie-fill")
    .forEach((fill) => {
      const raw = fill.style.getPropertyValue("--cible") || "50%";
      const base = parseFloat(raw) || 50;

      setInterval(() => {
        const jitter = (Math.random() - 0.5) * 3;
        fill.style.width = `${Math.max(2, base + jitter)}%`;
      }, 800);
    });
}

export function initDojoBoss() {
  if (!document.getElementById("dojo")) return;
  initCitations();
  initVictoireClavier();
  initBarresHp();
}
