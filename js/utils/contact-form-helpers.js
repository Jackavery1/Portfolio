export function messageErreurFormspree(payload, res) {
  if (res.status === 403) {
    return 'Envoi refusé (403). Vérifiez reCAPTCHA : PORTFOLIO_RECAPTCHA_SITE_KEY dans .env, même version (2 ou 3) que sur Formspree.';
  }
  if (res.status === 400) {
    const detail = payload && typeof payload.error === 'string' ? payload.error.trim() : '';
    if (detail) return detail;
    return 'Envoi refusé (400). Souvent : clé secrète reCAPTCHA incorrecte dans Formspree, ou domaine non autorisé (Settings → Restrict to Domain : laisser vide pour tester en local).';
  }
  if (!payload || typeof payload !== 'object') {
    return `Envoi refusé (${res.status})`;
  }
  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }
  const errs = payload.errors;
  if (errs && typeof errs === 'object') {
    const parts = Object.entries(errs).flatMap(([key, val]) => {
      if (typeof val === 'string') return [`${key}: ${val}`];
      if (Array.isArray(val)) return val.map((v) => `${key}: ${v}`);
      return [];
    });
    if (parts.length) return parts.join(' — ');
  }
  return `Envoi refusé (${res.status})`;
}

export function honeypotEstRempli(valeur) {
  return Boolean(String(valeur ?? '').trim());
}

export function peutSoumettre({ dernierEnvoi, rateLimitMs, maintenant = Date.now() }) {
  if (dernierEnvoi == null || dernierEnvoi === '') return true;
  const elapsed = maintenant - Number.parseInt(String(dernierEnvoi), 10);
  return !Number.isFinite(elapsed) || elapsed >= rateLimitMs;
}

export function messageErreurCatch(err) {
  const m = String(err?.message || err || '').trim();
  if (/recaptcha|grecaptcha|jeton/i.test(m)) {
    return m.startsWith('reCAPTCHA') || m.startsWith('Jeton') ? m : `reCAPTCHA : ${m}`;
  }
  if (m === 'Failed to fetch' || /network|fetch/i.test(m)) {
    return 'Connexion bloquée vers Formspree (AdBlock, extension ou hors ligne). Autorisez formspree.io et google.com, ou testez en navigation privée sans extensions.';
  }
  return m || 'Erreur inattendue lors de l’envoi.';
}

export function libellerSujetSelect(texteOption) {
  const sujetLabel = String(texteOption ?? '').trim();
  if (!sujetLabel || /^—/.test(sujetLabel)) return '';
  return sujetLabel;
}

export function construireFormDataFormspree({ nom, email, message, sujetLabel, recaptchaToken }) {
  const fd = new FormData();
  fd.append('name', nom);
  fd.append('email', email);
  fd.append('message', message);
  if (sujetLabel) fd.append('sujet', sujetLabel);
  fd.append('_replyto', email);
  fd.append('_subject', `[Portfolio] ${sujetLabel ? `${sujetLabel} — ` : ''}${nom}`);
  if (recaptchaToken) fd.append('g-recaptcha-response', recaptchaToken);
  return fd;
}
