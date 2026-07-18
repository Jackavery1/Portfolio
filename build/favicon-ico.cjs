/**
 * Encode un PNG en .ico (PNG embarqué, format Vista+).
 * @param {Buffer} pngBuffer
 * @param {number} largeur
 * @param {number} hauteur
 */
function encoderIcoDepuisPng(pngBuffer, largeur, hauteur) {
  const enTete = Buffer.alloc(6);
  enTete.writeUInt16LE(0, 0);
  enTete.writeUInt16LE(1, 2);
  enTete.writeUInt16LE(1, 4);

  const entree = Buffer.alloc(16);
  entree.writeUInt8(largeur >= 256 ? 0 : largeur, 0);
  entree.writeUInt8(hauteur >= 256 ? 0 : hauteur, 1);
  entree.writeUInt8(0, 2);
  entree.writeUInt8(0, 3);
  entree.writeUInt16LE(1, 4);
  entree.writeUInt16LE(32, 6);
  entree.writeUInt32LE(pngBuffer.length, 8);
  entree.writeUInt32LE(6 + 16, 12);

  return Buffer.concat([enTete, entree, pngBuffer]);
}

module.exports = { encoderIcoDepuisPng };
