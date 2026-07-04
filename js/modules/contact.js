import { initContactBandeau } from './contact-bandeau.js';
import { initContactForm } from './contact-form.js';

export async function initContactPage() {
  initContactBandeau();
  await initContactForm();
}
