import { pageFileFromPathname } from './page.js';

export function indexDansOrdreNavigation(pathname, ordre) {
  const file = pageFileFromPathname(pathname);
  return ordre.indexOf(file);
}
