import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { estEntreeDirecte, executerSiEntreeDirecte } = require('./cli-entry.mjs');

describe('cli-entry', () => {
  it('estEntreeDirecte compare require.main et module', () => {
    const ref = {};
    expect(estEntreeDirecte(ref, ref)).toBe(true);
    expect(estEntreeDirecte({}, ref)).toBe(false);
  });

  it('executerSiEntreeDirecte ignore si ce n’est pas l’entrée CLI', () => {
    const fn = vi.fn();
    executerSiEntreeDirecte({}, {}, fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('executerSiEntreeDirecte exécute la fonction si entree directe', () => {
    const ref = {};
    const fn = vi.fn();
    executerSiEntreeDirecte(ref, ref, fn);
    expect(fn).toHaveBeenCalledOnce();
  });
});
