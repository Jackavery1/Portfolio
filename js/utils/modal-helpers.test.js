import { describe, expect, it } from 'vitest';
import {
  cheminWebpDepuisRaster,
  estImageRaster,
  resolveApercuSrc,
} from './modal-helpers.js';

describe('modal-helpers', () => {
  it('résout l’aperçu projet', () => {
    expect(resolveApercuSrc({ apercu: 'assets/previews/lsf.png' })).toBe(
      'assets/previews/lsf.png',
    );
    expect(resolveApercuSrc({})).toBeNull();
  });

  it('détecte les images raster', () => {
    expect(estImageRaster('foo.png')).toBe(true);
    expect(estImageRaster('foo.svg')).toBe(false);
  });

  it('dérive le chemin webp', () => {
    expect(cheminWebpDepuisRaster('assets/previews/hub.jpeg')).toBe(
      'assets/previews/hub.webp',
    );
  });
});
