import { vi } from 'vitest';

export function creerRegistrationParDefaut(surcharge = {}) {
  return {
    waiting: null,
    update: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    ...surcharge,
  };
}

export function creerNavigatorServiceWorker({
  register,
  controller = null,
  onControllerChange,
} = {}) {
  const registration = creerRegistrationParDefaut();
  const registerFn = register ?? vi.fn().mockResolvedValue(registration);

  const navigator = {
    serviceWorker: {
      register: registerFn,
      controller,
      addEventListener: vi.fn((evt, fn) => {
        if (evt === 'controllerchange') onControllerChange?.(fn);
      }),
    },
  };

  return { navigator, register: registerFn, registration };
}

export function creerRegistrationAvecWaiting({
  waiting,
  controller = {},
  surcharge = {},
  onControllerChange,
} = {}) {
  const registration = creerRegistrationParDefaut({
    waiting,
    ...surcharge,
  });
  const register = vi.fn().mockResolvedValue(registration);
  const { navigator } = creerNavigatorServiceWorker({ register, controller, onControllerChange });
  return { register, registration, navigator };
}

export function creerRegistrationUpdateFound({ controller = {}, surcharge = {} } = {}) {
  const handlers = {};
  const worker = {
    state: 'installing',
    addEventListener: (evt, fn) => {
      handlers[evt] = fn;
    },
  };
  const registration = creerRegistrationParDefaut({
    waiting: null,
    installing: worker,
    addEventListener: vi.fn((evt, fn) => {
      if (evt === 'updatefound') handlers.updatefound = fn;
    }),
    ...surcharge,
  });
  const register = vi.fn().mockResolvedValue(registration);
  const { navigator } = creerNavigatorServiceWorker({ register, controller });

  return { register, registration, navigator, handlers, worker };
}
