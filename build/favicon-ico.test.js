import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { encoderIcoDepuisPng } = require('./favicon-ico.cjs');

describe('favicon-ico', () => {
  it('encode un en-tête ICO valide autour d’un PNG', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ico = encoderIcoDepuisPng(png, 32, 32);
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(1);
    expect(ico.readUInt8(6)).toBe(32);
    expect(ico.readUInt8(7)).toBe(32);
    expect(ico.readUInt32LE(14)).toBe(png.length);
    expect(ico.subarray(22).equals(png)).toBe(true);
  });
});
