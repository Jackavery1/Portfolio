/** Point d'entrée page contact — bandeau, coordonnées et formulaire. */
import { initialiserBandeauContact } from './contact-bandeau.js';
import { initialiserCoordonneesContact } from './contact-coordonnees.js';
import { initialiserFormulaireContact } from './contact-form.js';

export async function initialiserPageContact() {
  initialiserBandeauContact();
  initialiserCoordonneesContact();
  await initialiserFormulaireContact();
}
