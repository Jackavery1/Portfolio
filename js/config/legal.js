import { LEGAL } from './legal-data.js';

export { LEGAL };

export const LEGAL_ANCHOR_LABELS = LEGAL.sections.map(({ id, title }) => ({
  id,
  label: title,
}));
