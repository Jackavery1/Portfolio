import { MENTIONS_LEGALES } from './legal-data.js';

export { MENTIONS_LEGALES };

export const LIBELLES_ANCRES_MENTIONS = MENTIONS_LEGALES.sections.map(({ id, title }) => ({
  id,
  label: title,
}));
