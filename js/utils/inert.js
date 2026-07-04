export function basculerInertFond(actif, elementException = null) {
  document.querySelectorAll('body > *').forEach((el) => {
    if (elementException && el === elementException) return;
    if (actif) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}
