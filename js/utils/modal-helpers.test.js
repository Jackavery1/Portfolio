import { describe, expect, it } from 'vitest';
import {
  cheminWebpDepuisRaster,
  estImageRaster,
  estLienHttpAutorise,
  liensProjetValides,
  preparerImageModale,
  resoudreSrcApercu,
} from './modal-helpers.js';

describe('modal-helpers', () => {
  it('résout l’aperçu projet', () => {
    expect(resoudreSrcApercu({ apercu: 'assets/previews/lsf.png' })).toBe(
      'assets/previews/lsf.png'
    );
    expect(resoudreSrcApercu({})).toBeNull();
  });

  it('détecte les images raster', () => {
    expect(estImageRaster('foo.png')).toBe(true);
    expect(estImageRaster('foo.svg')).toBe(false);
  });

  it('dérive le chemin WebP depuis un raster', () => {
    expect(cheminWebpDepuisRaster('assets/previews/lsf.png')).toBe('assets/previews/lsf.webp');
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

  it('rejette les href mal formés', () => {
    expect(estLienHttpAutorise('pas-une-url')).toBe(false);
  });

  it('conserve les libellés personnalisés', () => {
    const liens = liensProjetValides({
      lienDemo: 'https://demo.example.com/',
      lienDemoLabel: '▶ Démo live',
      lien: 'https://github.com/foo/bar',
      lienLabel: '▶ Code source',
    });
    expect(liens).toEqual([
      { href: 'https://demo.example.com/', label: '▶ Démo live' },
      { href: 'https://github.com/foo/bar', label: '▶ Code source' },
    ]);
  });

  it('retourne démo et repo quand les deux sont valides', () => {
    const liens = liensProjetValides({
      lienDemo: 'https://demo.example.com/',
      lien: 'https://github.com/foo/bar',
    });
    expect(liens).toHaveLength(2);
  });
});

describe('preparerImageModale', () => {
  it('utilise le WebP pour un raster PNG', () => {
    const img = document.createElement('img');
    preparerImageModale(img, 'assets/previews/demo.png', 'Démo');
    expect(img.src).toContain('demo.webp');
    expect(img.alt).toBe('Aperçu — Démo');
    expect(img.loading).toBe('eager');
  });

  it('conserve le SVG sans conversion WebP', () => {
    const img = document.createElement('img');
    preparerImageModale(img, 'assets/previews/icon.svg', 'Icône');
    expect(img.src).toContain('icon.svg');
    expect(img.classList.contains('modal-img--svg')).toBe(true);
  });

  it('détache l’img d’un picture parent', () => {
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    const img = document.createElement('img');
    picture.append(source, img);
    document.body.append(picture);

    preparerImageModale(img, 'assets/previews/demo.png', 'Démo');

    expect(document.querySelector('picture')).toBeNull();
    expect(document.body.contains(img)).toBe(true);
  });
});
