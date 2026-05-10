# Portfolio — Joris Martinez

Site statique (HTML / CSS / JS) thème arcade CRT.

## Lancer en local

Ouvrir `index.html` dans un navigateur ou utiliser un serveur HTTP local (recommandé pour les chemins et le partage Open Graph) :

```bash
npx serve .
```

Ou l’extension Live Server de VS Code sur le dossier du projet.

## Contact

- **Sans backend** : le formulaire ouvre le client mail par défaut (`mailto:`) avec sujet et corps préremplis.
- **Avec Formspree** : créer un formulaire sur [formspree.io](https://formspree.io), puis dans `index.html` sur la balise `<form id="js-formulaire">` renseigner :

  `data-formspree="https://formspree.io/f/votre_id"`

 Les champs `nom`, `email`, `message` sont envoyés en POST ; adapter les noms si Formspree les exige.

## SEO et réseaux sociaux

- `meta` description, Open Graph et Twitter Card sont dans le `<head>`.
- Image de partage : `assets/og.png` (1200×630 recommandé pour les aperçus).
- Au chargement, le script met à jour l’URL absolue de `og:image`, ajoute `og:url` et le lien **canonical** selon l’URL actuelle. Les robots qui n’exécutent pas JavaScript voient encore `og:image` en chemin relatif ; pour une URL absolue figée en production, vous pouvez remplacer dans le HTML la valeur de `content` par `https://votredomaine.fr/assets/og.png`.

## Aperçus des projets (modal WORK)

Éditer `assets/previews_data.js` : l’objet `IMG` associe des clés (`v5_home`, `work`, etc.) à des chaînes data-URL ou chemins d’images, comme attendu par `script.js` et `PROJETS_DATA`.

## Fichiers principaux

| Fichier | Rôle |
|--------|------|
| `index.html` | Structure, sections, formulaire |
| `style.css` | Thème, responsive, modale |
| `script.js` | Navigation, modale, audio, formulaire |
| `assets/previews_data.js` | Images d’aperçu des projets |
| `assets/og.png` | Image Open Graph |
