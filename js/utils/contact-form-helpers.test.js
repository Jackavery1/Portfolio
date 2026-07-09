import { describe, expect, it } from 'vitest';
import {
  construireDonneesFormspree,
  potDeMielEstRempli,
  libellerSujetSelect,
  messageErreurCapture,
  messageErreurFormspree,
  peutSoumettre,
} from './contact-form-helpers.js';

describe('messageErreurFormspree', () => {
  it('retourne un message dédié pour 403', () => {
    expect(messageErreurFormspree(null, { status: 403 })).toMatch(/403/);
  });

  it('utilise payload.error pour 400', () => {
    expect(messageErreurFormspree({ error: '  Domaine refusé  ' }, { status: 400 })).toBe(
      'Domaine refusé'
    );
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

  it('retourne le message par défaut pour 400 sans détail', () => {
    expect(messageErreurFormspree({}, { status: 400 })).toMatch(/400/);
  });

  it('utilise payload.error hors statut 400', () => {
    expect(messageErreurFormspree({ error: '  Refusé  ' }, { status: 422 })).toBe('Refusé');
  });

  it('ignore les entrées errors non textuelles', () => {
    expect(
      messageErreurFormspree({ errors: { meta: { code: 1 } } }, { status: 422 })
    ).toBe('Envoi refusé (422)');
  });
});

describe('potDeMielEstRempli', () => {
  it('détecte une valeur non vide', () => {
    expect(potDeMielEstRempli(' bot ')).toBe(true);
    expect(potDeMielEstRempli('')).toBe(false);
    expect(potDeMielEstRempli(undefined)).toBe(false);
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

  it('autorise si le timestamp est invalide', () => {
    expect(peutSoumettre({ dernierEnvoi: 'pas-un-nombre', rateLimitMs })).toBe(true);
    expect(peutSoumettre({ dernierEnvoi: '', rateLimitMs })).toBe(true);
  });
});

describe('messageErreurCapture', () => {
  it('formate les erreurs reCAPTCHA', () => {
    expect(messageErreurCapture(new Error('grecaptcha indisponible'))).toMatch(/reCAPTCHA/i);
  });

  it('formate Failed to fetch', () => {
    expect(messageErreurCapture(new Error('Failed to fetch'))).toMatch(/Formspree/i);
  });

  it('conserve un message reCAPTCHA déjà préfixé', () => {
    expect(messageErreurCapture(new Error('Jeton expiré'))).toBe('Jeton expiré');
  });

  it('retourne un message générique si l’erreur est vide', () => {
    expect(messageErreurCapture(null)).toMatch(/inattendue/i);
  });
});

describe('libellerSujetSelect', () => {
  it('ignore le placeholder tiret', () => {
    expect(libellerSujetSelect('— Choisir —')).toBe('');
    expect(libellerSujetSelect('  Candidature  ')).toBe('Candidature');
  });
});

describe('construireDonneesFormspree', () => {
  it('remplit les champs attendus', () => {
    const fd = construireDonneesFormspree({
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

  it('omet le sujet et le jeton si absents', () => {
    const fd = construireDonneesFormspree({
      nom: 'Ada',
      email: 'ada@test.com',
      message: 'Bonjour',
      sujetLabel: '',
      recaptchaToken: null,
    });
    expect(fd.get('sujet')).toBeNull();
    expect(fd.get('g-recaptcha-response')).toBeNull();
    expect(fd.get('_subject')).toBe('[Portfolio] Ada');
  });
});
