/* ============================================
   Focus : modale (éléments focusables + piège Tab)
   ============================================ */

export function elementsFocusablesModale(container) {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

/* Tab : boucle premier ↔ dernier focusable */
export function piegerTabulationModale(evt, modalEl) {
  if (evt.key !== 'Tab') return false;
  const list = elementsFocusablesModale(modalEl);
  if (list.length === 0) return true;
  if (list.length === 1) {
    evt.preventDefault();
    list[0].focus();
    return true;
  }
  const first = list[0];
  const last = list[list.length - 1];
  if (evt.shiftKey) {
    if (document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    evt.preventDefault();
    first.focus();
  }
  return true;
}
