export function resolveApercuSrc(data) {
  return data?.apercu || null;
}

export function estImageRaster(src) {
  return /\.(png|jpe?g)$/i.test(src || '');
}

export function cheminWebpDepuisRaster(src) {
  return String(src).replace(/\.(png|jpe?g)$/i, '.webp');
}
