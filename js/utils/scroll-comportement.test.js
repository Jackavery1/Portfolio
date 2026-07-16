import { describe, expect, it, vi, afterEach } from 'vitest';
import { comportementScroll } from './scroll-comportement.js';

describe('scroll-comportement', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retourne smooth par défaut', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(comportementScroll()).toBe('smooth');
  });

  it('retourne auto sous prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(comportementScroll()).toBe('auto');
  });
});
