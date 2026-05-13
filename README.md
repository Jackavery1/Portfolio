# Portfolio — Joris Martinez

Site statique (HTML / CSS / JS) thème arcade CRT, découpé en **plusieurs pages HTML** (même en-tête et pied de page copiés dans chaque fichier, sans outil de build).

## Pages

| Fichier | Contenu |
|--------|---------|
| `index.html` | Accueil (HOME) |
| `projets.html` | Projets (WORK) + modale d’aperçu |
| `dojo.html` | Dojo (lien depuis la page projets) |
| `competences.html` | Compétences (STATS) |
| `parcours.html` | Parcours (STORY) |
| `contact.html` | Contact + formulaire |

Les styles et scripts sont communs : `style.css`, `script.js`. La page projets charge en plus `assets/previews_data.js` pour les images de la modale.

Pour un changement global (menu, bandeau CRT, pied de page), reprendre le même bloc dans chaque fichier `.html` concerné.

## Lancer en local

Ouvrir `index.html` dans un navigateur ou utiliser un serveur HTTP local (recommandé pour les chemins relatifs entre pages et le partage Open Graph) :

```bash
npx serve .
```

Ou l’extension Live Server de VS Code sur le dossier du projet.

## Contact

- **Sans backend** : le formulaire ouvre le client mail par défaut (`mailto:`) avec sujet et corps préremplis.
- **Avec Formspree** : créer un formulaire sur [formspree.io](https://formspree.io), puis dans `contact.html` sur la balise `<form id="js-formulaire">` renseigner :

  `data-formspree="https://formspree.io/f/votre_id"`

 Les champs `nom`, `email`, `message` sont envoyés en POST ; adapter les noms si Formspree les exige.

## SEO et réseaux sociaux

- Les balises `meta` (description, Open Graph, Twitter) sont dupliquées dans le `<head>` de chaque page ; tu peux affiner le titre et la description par page si besoin.
- Image de partage : `assets/og.png` (1200×630 recommandé pour les aperçus).
- Au chargement, `script.js` met à jour l’URL absolue de `og:image`, ajoute `og:url` et le lien **canonical** selon l’URL actuelle. Pour une URL absolue figée en production, tu peux remplacer dans chaque HTML la valeur de `content` de `og:image` par `https://votredomaine.fr/assets/og.png`.

## Aperçus des projets (modal sur `projets.html`)

Éditer `assets/previews_data.js` : l’objet `IMG` associe des clés (`v5_home`, `work`, etc.) à des chaînes data-URL ou chemins d’images, comme attendu par `script.js` et `PROJETS_DATA`.

## Fichiers principaux

| Fichier | Rôle |
|--------|------|
| `*.html` | Pages (structure + contenu) |
| `style.css` | Thème, responsive, modale |
| `script.js` | Burger, score, flèches entre pages, modale, formulaire, Konami |
| `assets/previews_data.js` | Images d’aperçu des projets |
| `assets/og.png` | Image Open Graph |
