/** Latin suffit pour le FR (accents Latin-1) ; pas de œ/€ dans l’UI. */
export const SOUS_ENSEMBLES = ['latin'];

export const POLICES = [
  {
    package: '@fontsource/press-start-2p',
    base: 'press-start-2p',
    cssFamily: 'Press Start 2P',
  },
  {
    package: '@fontsource/vt323',
    base: 'vt323',
    cssFamily: 'VT323',
  },
  {
    package: '@fontsource/rajdhani',
    base: 'rajdhani',
    cssFamily: 'Rajdhani',
  },
];

export function entreesPolices() {
  return POLICES.flatMap(({ package: pkg, base, cssFamily }) =>
    SOUS_ENSEMBLES.map((subset) => ({
      package: pkg,
      src: `${base}-${subset}-400-normal.woff2`,
      dst: `${base}-${subset}-400.woff2`,
      subset,
      cssFamily,
    }))
  );
}

export const FONT_FILES = entreesPolices();
