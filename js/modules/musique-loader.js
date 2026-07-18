/**
 * Chargement différé de musique.js (~25 Ko) — le séquenceur n'est importé qu'à la demande.
 */

import { CONFIGURATION } from '../config/index.js';
import { parId } from '../utils/dom.js';
import { deverrouillerAudioAuGeste } from './audio-unlock.js';
import { appliquerEtatBoutonMusique, lirePreferenceMusique } from './musique-bouton.js';

let promesseModule = null;

function importerMusique() {
  if (!promesseModule) promesseModule = import('./musique.js');
  return promesseModule;
}

async function assurerModuleInitialise() {
  const m = await importerMusique();
  const bouton = parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE);
  if (bouton && !bouton.dataset.branche) {
    m.initialiserMusique();
  }
  return m;
}

/** Branche le bouton nav sans charger le séquenceur tant qu'il n'y a pas d'interaction */
export function initialiserMusique() {
  const bouton = parId(CONFIGURATION.SELECTEURS.BOUTON_MUSIQUE);
  if (!bouton || bouton.dataset.musiqueLoader) return;
  bouton.dataset.musiqueLoader = '1';

  const preference = lirePreferenceMusique(CONFIGURATION.STOCKAGE.CLE_MUSIQUE);
  appliquerEtatBoutonMusique(bouton, preference ? 'pret' : 'off');

  async function surPremierClicBouton(evt) {
    if (bouton.dataset.branche) return;
    evt.preventDefault();
    evt.stopImmediatePropagation();
    deverrouillerAudioAuGeste();
    try {
      const m = await assurerModuleInitialise();
      bouton.removeEventListener('click', surPremierClicBouton, true);
      await m.basculerMusique();
    } catch {
      bouton.removeEventListener('click', surPremierClicBouton, true);
    }
  }

  bouton.addEventListener('click', surPremierClicBouton, true);

  if (preference) {
    const surPremiereInteraction = async (evt) => {
      if (bouton.contains(evt.target)) return;
      document.removeEventListener('click', surPremiereInteraction, true);
      document.removeEventListener('keydown', surPremiereInteraction, true);
      deverrouillerAudioAuGeste();
      const m = await assurerModuleInitialise();
      await m.activerMusique();
    };
    document.addEventListener('click', surPremiereInteraction, { capture: true, once: true });
    document.addEventListener('keydown', surPremiereInteraction, { once: true });
  }
}

export function jouerJingleVictoire() {
  void assurerModuleInitialise().then((m) => m.jouerJingleVictoire());
}

export function jouerJingleSecret() {
  void assurerModuleInitialise().then((m) => m.jouerJingleSecret());
}
