# Sécurité

Signaler une vulnérabilité par e-mail (contact du site), **pas** via une issue publique.

Inclure : description, reproduction, URL/version concernée.

Délai de réponse visé : 7 jours ouvrés.

**Périmètre :** code du site, workflow CI, intégration Formspree/reCAPTCHA (clé **site** uniquement).

**Hors périmètre :** infrastructure GitHub / Formspree / Google, DoS, ingénierie sociale.

Ne jamais committer `.env.local`, clés secrètes Formspree ou reCAPTCHA secret.
