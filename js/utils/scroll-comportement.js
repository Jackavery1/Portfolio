/** Comportement de scroll respectant prefers-reduced-motion. */

import { prefereMouvementReduit } from './mouvement-reduit.js';

export function comportementScroll() {
  return prefereMouvementReduit() ? 'auto' : 'smooth';
}
