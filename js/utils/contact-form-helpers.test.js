import { describe, expect, it } from 'vitest';
import {
  construireFormDataFormspree,
  honeypotEstRempli,
  libellerSujetSelect,
  messageErreurCatch,
  messageErreurFormspree,
  peutSoumettre,
} from './contact-form-helpers.js';

describe('messageErreurFormspree', () => {
  it('retourne un message dédié pour 403', () => {
    expect(messageErreurFormspree(null, { status: 403 })).toMatch(/403/);
  });

  it('utilise payload.error pour 400', () => {
    expect(
      messageErreurFormspree({ error: '  Domaine refusé  ' }, { status: 400 })
    ).toBe('Domaine refusé');
  });

  it('agrège payload.errors', () => {
    expect(
      messageErreurFormspree(
        { errors: { email: 'invalide', nom: ['trop court', 'requis'] } },
        { status: 422 }
      )
    ).toBe('email: invalide — nom: trop court — nom: requis');
  });

  it('gère un corps non objet', () => {
    expect(messageErreurFormspree(null, { status: 500 })).toBe('Envoi refusé (500)');
  });
});

describe('honeypotEstRempli', () => {
  it('détecte une valeur non vide', () => {
    expect(honeypotEstRempli(' bot ')).toBe(true);
    expect(honeypotEstRempli('')).toBe(false);
    expect(honeypotEstRempli(undefined)).toBe(false);
  });
});

describe('peutSoumettre', () => {
  const rateLimitMs = 60_000;

  it('autorise sans historique', () => {
    expect(peutSoumettre({ dernierEnvoi: null, rateLimitMs })).toBe(true);
  });

  it('bloque avant la fin du délai', () => {
    const now = 1_000_000;
    expect(
      peutSoumettre({
        dernierEnvoi: String(now - 30_000),
        rateLimitMs,
        maintenant: now,
      })
    ).toBe(false);
  });

  it('autorise après le délai', () => {
    const now = 1_000_000;
    expect(
      peutSoumettre({
        dernierEnvoi: String(now - 61_000),
        rateLimitMs,
        maintenant: now,
      })
    ).toBe(true);
  });
});

describe('messageErreurCatch', () => {
  it('formate les erreurs reCAPTCHA', () => {
    expect(messageErreurCatch(new Error('grecaptcha indisponible'))).toMatch(/reCAPTCHA/i);
  });

  it('formate Failed to fetch', () => {
    expect(messageErreurCatch(new Error('Failed to fetch'))).toMatch(/Formspree/i);
  });
});

describe('libellerSujetSelect', () => {
  it('ignore le placeholder tiret', () => {
    expect(libellerSujetSelect('— Choisir —')).toBe('');
    expect(libellerSujetSelect('  Candidature  ')).toBe('Candidature');
  });
});

describe('construireFormDataFormspree', () => {
  it('remplit les champs attendus', () => {
    const fd = construireFormDataFormspree({
      nom: 'Ada',
      email: 'ada@test.com',
      message: 'Bonjour',
      sujetLabel: 'Stage',
      recaptchaToken: 'token-xyz',
    });
    expect(fd.get('name')).toBe('Ada');
    expect(fd.get('g-recaptcha-response')).toBe('token-xyz');
    expect(fd.get('_subject')).toBe('[Portfolio] Stage — Ada');
  });
});
