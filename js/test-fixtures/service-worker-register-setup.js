import { vi } from 'vitest';
import { creerNavigatorServiceWorker } from './service-worker-mock.js';

export function preparerEnvironnementSw() {
  vi.resetModules();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  const nav = creerNavigatorServiceWorker();
  vi.stubGlobal('navigator', nav.navigator);
  return nav;
}
