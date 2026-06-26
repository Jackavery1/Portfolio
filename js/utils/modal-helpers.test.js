import { describe, expect, it } from 'vitest';
import {
  cheminWebpDepuisRaster,
  estImageRaster,
  estLienHttpAutorise,
  liensProjetValides,
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

  it('dérive le chemin WebP depuis un raster', () => {
    expect(cheminWebpDepuisRaster('assets/previews/lsf.png')).toBe(
      'assets/previews/lsf.webp',
    );
    expect(cheminWebpDepuisRaster('foo.svg')).toBeNull();
  });

  it('valide les liens http(s) autorisés', () => {
    expect(estLienHttpAutorise('https://github.com/foo')).toBe(true);
    expect(estLienHttpAutorise('http://example.com')).toBe(true);
    expect(estLienHttpAutorise('javascript:alert(1)')).toBe(false);
    expect(estLienHttpAutorise('')).toBe(false);
  });

  it('filtre les liens projet pour la modale', () => {
    const liens = liensProjetValides({
      lienDemo: 'https://projetlsf.onrender.com/',
      lien: 'javascript:alert(1)',
    });
    expect(liens).toHaveLength(1);
    expect(liens[0].href).toBe('https://projetlsf.onrender.com/');
  });

  it('retourne démo et repo quand les deux sont valides', () => {
    const liens = liensProjetValides({
      lienDemo: 'https://demo.example.com/',
      lien: 'https://github.com/foo/bar',
    });
    expect(liens).toHaveLength(2);
  });
});
