const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Rajdhani:wght@400;600&display=swap';

export function initPolicesAsync() {
  if (document.querySelector('link[data-portfolio-fonts]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_URL;
  link.dataset.portfolioFonts = '1';
  document.head.appendChild(link);
}
