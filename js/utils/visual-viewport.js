/** Ajuste le scroll quand le clavier virtuel réduit visualViewport (mobile). */

import { comportementScroll } from './scroll-comportement.js';

const SELECTEUR_CHAMPS = 'input, textarea, select';

export function initialiserScrollChampClavier(conteneur) {
  if (!conteneur || typeof window === 'undefined' || !window.visualViewport) {
    return () => {};
  }

  let champActif = null;

  const ajusterScroll = () => {
    if (!champActif || !conteneur.contains(champActif)) return;

    const vv = window.visualViewport;
    const rect = champActif.getBoundingClientRect();
    const marge = 16;
    const basVisible = vv.height - marge;
    const behavior = comportementScroll();

    if (rect.bottom > basVisible) {
      window.scrollBy({ top: rect.bottom - basVisible, behavior });
    } else if (rect.top < marge) {
      window.scrollBy({ top: rect.top - marge, behavior });
    }
  };

  const onFocusIn = (evt) => {
    if (!evt.target.matches(SELECTEUR_CHAMPS)) return;
    champActif = evt.target;
    requestAnimationFrame(ajusterScroll);
  };

  const onFocusOut = () => {
    champActif = null;
  };

  conteneur.addEventListener('focusin', onFocusIn);
  conteneur.addEventListener('focusout', onFocusOut);
  window.visualViewport.addEventListener('resize', ajusterScroll);
  window.visualViewport.addEventListener('scroll', ajusterScroll);

  return () => {
    conteneur.removeEventListener('focusin', onFocusIn);
    conteneur.removeEventListener('focusout', onFocusOut);
    window.visualViewport.removeEventListener('resize', ajusterScroll);
    window.visualViewport.removeEventListener('scroll', ajusterScroll);
    champActif = null;
  };
}
