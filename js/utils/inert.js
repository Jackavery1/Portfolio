export function basculerInertFond(actif, elementException = null) {
  document.querySelectorAll('body > *').forEach((el) => {
    if (elementException && el === elementException) {
      el.removeAttribute('inert');
      return;
    }
    if (actif) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
}
