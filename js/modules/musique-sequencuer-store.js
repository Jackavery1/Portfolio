/** État mutable du séquenceur chiptune — isolé pour testabilité. */

const etat = {
  themes: null,
  themeParSection: null,
  themeParFichier: null,
  promesseThemes: null,
  actif: false,
  minuteurPlanificateur: null,
  pasCourant: 0,
  prochainTempsAudio: 0,
  themeCourant: 'HOME',
};

export function lireEtatSequencuer() {
  return etat;
}

export function reinitialiserEtatSequencuerStore() {
  etat.themes = null;
  etat.themeParSection = null;
  etat.themeParFichier = null;
  etat.promesseThemes = null;
  etat.actif = false;
  if (etat.minuteurPlanificateur) clearTimeout(etat.minuteurPlanificateur);
  etat.minuteurPlanificateur = null;
  etat.pasCourant = 0;
  etat.prochainTempsAudio = 0;
  etat.themeCourant = 'HOME';
}
