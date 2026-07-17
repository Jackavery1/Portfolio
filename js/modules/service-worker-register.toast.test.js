import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { injecterCspProd } from '../test-fixtures/csp-prod.js';
import {
  creerNavigatorServiceWorker,
  creerRegistrationAvecWaiting,
  creerRegistrationUpdateFound,
} from '../test-fixtures/service-worker-mock.js';
import { preparerEnvironnementSw } from '../test-fixtures/service-worker-register-setup.js';

describe('service-worker-register — toast', () => {
  let register;

  beforeEach(() => {
    const nav = preparerEnvironnementSw();
    register = nav.register;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche le toast si un worker attend une mise à jour', async () => {
    injecterCspProd();
    const waiting = { postMessage: vi.fn() };
    const { navigator } = creerRegistrationAvecWaiting({ waiting });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    const toast = document.getElementById('js-sw-toast');
    expect(toast).not.toBeNull();
    expect(toast.hidden).toBe(false);
    toast.querySelector('.sw-toast__bouton').click();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('masque le toast au clic sur fermer', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    const toast = document.getElementById('js-sw-toast');
    toast.querySelector('.sw-toast__fermer').click();
    expect(toast.hidden).toBe(true);
  });

  it('affiche le toast après updatefound + statechange installed', async () => {
    injecterCspProd();
    const { navigator, registration, handlers, worker } = creerRegistrationUpdateFound();
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    registration.waiting = { postMessage: vi.fn() };
    handlers.updatefound?.();
    worker.state = 'installed';
    handlers.statechange?.();

    const toast = document.getElementById('js-sw-toast');
    expect(toast).not.toBeNull();
    expect(toast.hidden).toBe(false);
  });

  it('recharge la page après controllerchange si mise à jour demandée', async () => {
    injecterCspProd();
    let onControllerChange;
    const waiting = { postMessage: vi.fn() };
    const { navigator } = creerRegistrationAvecWaiting({
      waiting,
      onControllerChange: (fn) => {
        onControllerChange = fn;
      },
    });
    vi.stubGlobal('navigator', navigator);
    const reload = vi.fn();
    vi.stubGlobal('location', { hostname: 'localhost', search: '', reload });

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    document.getElementById('js-sw-toast').querySelector('.sw-toast__bouton').click();
    onControllerChange();

    expect(reload).toHaveBeenCalled();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('n’injecte qu’un seul élément toast dans le DOM', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(document.querySelectorAll('#js-sw-toast')).toHaveLength(1);
  });

  it('n’affiche pas le toast si waiting sans controller actif', async () => {
    injecterCspProd();
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
      controller: null,
    });
    vi.stubGlobal('navigator', navigator);

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(document.getElementById('js-sw-toast')).toBeNull();
  });

  it('ignore updatefound si installing est absent', async () => {
    injecterCspProd();
    const handlers = {};
    const registration = {
      waiting: null,
      installing: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn((evt, fn) => {
        if (evt === 'updatefound') handlers.updatefound = fn;
      }),
    };
    register.mockResolvedValueOnce(registration);
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(() => handlers.updatefound?.()).not.toThrow();
    expect(document.getElementById('js-sw-toast')).toBeNull();
  });

  it('ne recharge pas sur controllerchange sans clic Actualiser', async () => {
    injecterCspProd();
    let onControllerChange;
    const { navigator } = creerRegistrationAvecWaiting({
      waiting: { postMessage: vi.fn() },
      onControllerChange: (fn) => {
        onControllerChange = fn;
      },
    });
    vi.stubGlobal('navigator', navigator);
    const reload = vi.fn();
    vi.stubGlobal('location', { hostname: 'localhost', search: '', reload });

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    onControllerChange();
    expect(reload).not.toHaveBeenCalled();
  });

  it('n’affiche le toast qu’une fois si waiting est déjà connu', async () => {
    injecterCspProd();
    const handlers = {};
    const waiting = { postMessage: vi.fn() };
    const registration = {
      waiting,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn((evt, fn) => {
        if (evt === 'updatefound') handlers.updatefound = fn;
      }),
    };
    const { navigator } = creerNavigatorServiceWorker({
      register: vi.fn().mockResolvedValue(registration),
      controller: {},
    });
    vi.stubGlobal('navigator', navigator);
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');

    const { enregistrerServiceWorker } = await import('./service-worker-register.js');
    enregistrerServiceWorker();
    await Promise.resolve();

    expect(document.querySelectorAll('#js-sw-toast')).toHaveLength(1);
    registration.installing = {
      state: 'installed',
      addEventListener: (_evt, fn) => fn(),
    };
    handlers.updatefound?.();
    expect(document.querySelectorAll('#js-sw-toast')).toHaveLength(1);
  });
});
