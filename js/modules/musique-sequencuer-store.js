/** État mutable du séquenceur chiptune — isolé pour testabilité. */

const etat = {
  themes: null,
  themeParSection: null,
  themeParFichier: null,
  promesseThemes: null,
  actif: false,
  sequenceurEnCours: false,
  minuteurPlanificateur: null,
  pasCourant: 0,
  prochainTempsAudio: 0,
  themeCourant: 'HOME',
};

export function lireEtatSequencuer() {
  return {
    themes: etat.themes,
    themeParSection: etat.themeParSection,
    themeParFichier: etat.themeParFichier,
    promesseThemes: etat.promesseThemes,
    actif: etat.actif,
    sequenceurEnCours: etat.sequenceurEnCours,
    minuteurPlanificateur: etat.minuteurPlanificateur,
    pasCourant: etat.pasCourant,
    prochainTempsAudio: etat.prochainTempsAudio,
    themeCourant: etat.themeCourant,
  };
}

export function definirActifSequencuer(valeur) {
  etat.actif = valeur;
}

export function definirThemeCourantSequencuer(theme) {
  etat.themeCourant = theme;
}

export function definirCatalogueThemesSequencuer(themes, themeParSection, themeParFichier) {
  etat.themes = themes;
  etat.themeParSection = themeParSection;
  etat.themeParFichier = themeParFichier;
}

export function definirPromesseThemesSequencuer(promesse) {
  etat.promesseThemes = promesse;
}

export function definirSequenceurEnCours(valeur) {
  etat.sequenceurEnCours = valeur;
}

export function definirMinuteurPlanificateur(minuteur) {
  etat.minuteurPlanificateur = minuteur;
}

export function definirPasCourant(pas) {
  etat.pasCourant = pas;
}

export function definirProchainTempsAudio(temps) {
  etat.prochainTempsAudio = temps;
}

export function reinitialiserEtatSequencuerStore() {
  etat.themes = null;
  etat.themeParSection = null;
  etat.themeParFichier = null;
  etat.promesseThemes = null;
  etat.actif = false;
  etat.sequenceurEnCours = false;
  if (etat.minuteurPlanificateur) clearTimeout(etat.minuteurPlanificateur);
  etat.minuteurPlanificateur = null;
  etat.pasCourant = 0;
  etat.prochainTempsAudio = 0;
  etat.themeCourant = 'HOME';
}
