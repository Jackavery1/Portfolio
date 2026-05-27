# Politique de sécurité

## Versions supportées

Seule la branche **`main`** déployée sur GitHub Pages fait l’objet de correctifs de sécurité.

## Signaler une vulnérabilité

**Ne pas** créer d’issue publique GitHub pour un problème de sécurité.

Contactez le mainteneur par e-mail (adresse indiquée sur le site / page contact du portfolio).

Indiquez si possible :

- description du problème et impact ;
- étapes de reproduction ;
- version / URL concernée ;
- suggestion de correctif (optionnel).

Délai de réponse visé : sous 7 jours ouvrés.

## Périmètre

Inclus :

- code source du site (HTML, CSS, JS, `build.js`) ;
- workflow GitHub Actions ;
- intégrations documentées (Formspree, reCAPTCHA côté **clé site** publique).

Hors périmètre :

- infrastructure GitHub / Formspree / Google (signaler directement à ces fournisseurs) ;
- attaques par déni de service ;
- ingénierie sociale.

## Bonnes pratiques pour les contributeurs

- Ne jamais committer de **clé secrète** reCAPTCHA, token API Formspree privé, ou fichier `.env` réel.
- La clé **site** reCAPTCHA dans `js/config.js` est publique par conception ; la clé **secrète** reste uniquement dans le tableau de bord Formspree.
- Vérifier `npm audit` après mise à jour des dépendances.

## Divulgation responsable

Nous traitons les rapports de bonne foi et corrigeons avant divulgation publique lorsque c’est possible.
