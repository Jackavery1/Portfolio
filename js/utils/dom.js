/* ============================================
   Helpers DOM simples
   ============================================ */

export function byId(id) {
  return document.getElementById(id);
}

export function byQs(sel, parent = document) {
  return parent.querySelector(sel);
}

export function byQsAll(sel, parent = document) {
  return Array.from(parent.querySelectorAll(sel));
}
