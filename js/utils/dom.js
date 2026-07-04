/* ============================================
   Helpers DOM simples
   ============================================ */

export function parId(id) {
  return document.getElementById(id);
}

export function tousParSelecteur(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}
