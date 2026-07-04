export function basculerInertFond(actif, exceptionEl = null) {
  document.querySelectorAll('body > *').forEach((el) => {
    if (exceptionEl && el === exceptionEl) return;
    if (actif) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}
