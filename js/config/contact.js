import { FORMSPREE_ENDPOINT, RECAPTCHA_SITE_KEY } from './defaults.js';

export const CONTACT = {
  EMAIL_B64: 'am9yaXNkYXZpZC5tYXJ0aW5lei5wcm9AZ21haWwuY29t',
  PHONE_PARTS: [6, 74, 52, 24, 96],
  FORMSPREE_ENDPOINT,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_VERSION: 3,
  HONEYPOT_NAME: '_gotcha',
  RATE_LIMIT_MS: 60_000,
  LIMITS: { nom: 120, email: 254, message: 5000 },
  CV_HREF: 'assets/cv-martinez-joris.pdf',
  CV_DOWNLOAD: 'CV-Martinez-Joris.pdf',
};
