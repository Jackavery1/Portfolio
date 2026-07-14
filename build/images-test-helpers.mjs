import { vi } from 'vitest';

export function creerSharpMock() {
  const instances = [];

  function sharpFactory() {
    const instance = {
      rotate: vi.fn(function rotate() {
        return this;
      }),
      jpeg: vi.fn(function jpeg() {
        return this;
      }),
      png: vi.fn(function png() {
        return this;
      }),
      webp: vi.fn(function webp() {
        return this;
      }),
      resize: vi.fn(function resize() {
        return this;
      }),
      composite: vi.fn(function composite() {
        return this;
      }),
      toFile: vi.fn(() => Promise.resolve()),
      toBuffer: vi.fn(() => Promise.resolve(Buffer.from([0x89, 0x50, 0x4e, 0x47]))),
      metadata: vi.fn(() => Promise.resolve({ width: 80, height: 80 })),
    };
    instances.push(instance);
    return instance;
  }

  return { sharpFactory, instances };
}
