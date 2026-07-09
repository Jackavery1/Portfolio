/* État bouton nav musique — partagé entre loader et module principal */

export function lirePreferenceMusique(cle) {
  try {
    return localStorage.getItem(cle) === 'true';
  } catch {
    return false;
  }
}

export function sauvegarderPreferenceMusique(cle, valeur) {
  try {
    localStorage.setItem(cle, valeur ? 'true' : 'false');
  } catch {
    /* localStorage indisponible */
  }
}

export function appliquerEtatBoutonMusique(bouton, etat) {
  if (!bouton) return;

  const libelle = bouton.querySelector('.nav__musique-libelle');
  bouton.dataset.etat = etat;

  if (etat === 'on') {
    bouton.setAttribute('aria-pressed', 'true');
    bouton.setAttribute('aria-label', 'Couper la musique');
    if (libelle) libelle.textContent = 'ON';
    bouton.removeAttribute('title');
    return;
  }

  if (etat === 'pret') {
    bouton.setAttribute('aria-pressed', 'false');
    bouton.setAttribute('aria-label', 'Musique prête — cliquez ou interagissez pour lancer');
    if (libelle) libelle.textContent = 'PRÊT';
    bouton.setAttribute('title', 'Musique prête — cliquez pour lancer');
    return;
  }

  bouton.setAttribute('aria-pressed', 'false');
  bouton.setAttribute('aria-label', 'Activer la musique');
  if (libelle) libelle.textContent = '';
  bouton.setAttribute('title', 'Activer la musique arcade');
}
