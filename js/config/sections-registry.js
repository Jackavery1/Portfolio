/**
 * Charges lazy par section — une entrée par page avec initialiseur.
 * Nouvelle page : ajouter l'id dans sections-manifest.js + bloc ici.
 *
 * @typedef {{ module: string, init: string | string[] }} ChargeSection
 */

/** @type {Record<string, ChargeSection[]>} */
export const CHARGES_SECTION = {
  projets: [
    { module: '../modules/projets-grille.js', init: 'initialiserGrilleProjets' },
    {
      module: '../modules/modal.js',
      init: ['initialiserClavierModale', 'initialiserClicsModale'],
    },
  ],
  dojo: [{ module: '../modules/dojo-boss.js', init: 'initialiserDojoBoss' }],
  contact: [{ module: '../modules/contact.js', init: 'initialiserPageContact' }],
  mentions: [{ module: '../modules/mentions-legales.js', init: 'initialiserMentionsLegales' }],
};
