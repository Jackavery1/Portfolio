import { afterEach, describe, expect, it, vi } from 'vitest';
import { estPageDense, planifierIdleDense } from './pages-denses.js';

describe('pages-denses', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('identifie les sections à contenu lourd', () => {
    expect(estPageDense('competences')).toBe(true);
    expect(estPageDense('parcours')).toBe(true);
    expect(estPageDense('dojo')).toBe(true);
    expect(estPageDense('accueil')).toBe(false);
  });

  it('planifie en idle sur page dense', () => {
    const idle = vi.fn();
    vi.stubGlobal('requestIdleCallback', idle);
    const fn = vi.fn();
    expect(planifierIdleDense('dojo', fn, 1000)).toBe(true);
    expect(idle).toHaveBeenCalledWith(fn, { timeout: 1000 });
    expect(fn).not.toHaveBeenCalled();
  });

  it('ne planifie pas sur page légère', () => {
    vi.stubGlobal('requestIdleCallback', vi.fn());
    expect(planifierIdleDense('accueil', vi.fn(), 1000)).toBe(false);
  });
});
