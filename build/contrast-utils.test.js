/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { ratioContrasteElementDom, ratioContrasteHex } from './contrast-utils.mjs';

describe('contrast-utils', () => {
  it('calcule un ratio AA pour texte fort sur fond page', () => {
    expect(ratioContrasteHex('#d0ddff', '#03040f')).toBeGreaterThanOrEqual(4.5);
  });

  it('échoue AA pour un gris trop clair sur fond sombre', () => {
    expect(ratioContrasteHex('#444444', '#03040f')).toBeLessThan(4.5);
  });

  it('blanc sur noir approche 21:1', () => {
    expect(ratioContrasteHex('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('normalise espaces autour du hex', () => {
    expect(ratioContrasteHex('  #d0ddff  ', '#03040f')).toBeCloseTo(
      ratioContrasteHex('#d0ddff', '#03040f')
    );
  });

  it('ratioContrasteElementDom retourne 0 si color non parseable', () => {
    document.body.innerHTML = '<p id="t">x</p>';
    const el = document.getElementById('t');
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = (node) => {
      const style = original(node);
      if (node !== el) return style;
      return {
        color: 'invalid',
        backgroundColor: style.backgroundColor,
      };
    };
    try {
      expect(ratioContrasteElementDom(el)).toBe(0);
    } finally {
      window.getComputedStyle = original;
    }
  });

  it('ratioContrasteElementDom remonte un parent opaque si fond transparent', () => {
    document.body.innerHTML =
      '<div style="background:#03040f"><span id="t" style="color:#d0ddff;background:rgba(0,0,0,0)">x</span></div>';
    expect(ratioContrasteElementDom(document.getElementById('t'))).toBeGreaterThanOrEqual(4.5);
  });

  it('ratioContrasteElementDom calcule un ratio > 4.5 pour texte fort', () => {
    document.body.innerHTML = '<p id="t" style="color:#d0ddff;background-color:#03040f">x</p>';
    expect(ratioContrasteElementDom(document.getElementById('t'))).toBeGreaterThanOrEqual(4.5);
  });

  it('ratioContrasteElementDom utilise le fallback noir si body non parseable', () => {
    document.body.innerHTML =
      '<span id="t" style="color:#ffffff;background:rgba(0,0,0,0)">x</span>';
    const original = window.getComputedStyle.bind(window);
    window.getComputedStyle = (node) => {
      const style = original(node);
      if (node === document.body) {
        return { color: style.color, backgroundColor: 'invalid' };
      }
      if (node === document.getElementById('t')) {
        return { color: 'rgb(255, 255, 255)', backgroundColor: 'rgba(0, 0, 0, 0)' };
      }
      return style;
    };
    try {
      expect(ratioContrasteElementDom(document.getElementById('t'))).toBeCloseTo(21, 0);
    } finally {
      window.getComputedStyle = original;
    }
  });
});
