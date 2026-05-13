# Portfolio Arcade CRT v6

Portfolio personnel avec thème arcade rétro, système de score, modal projets.

**Stack** : HTML5 + CSS modulé (`styles/`, agrégateur `style.css`) + JavaScript ES6 modules (`js/`) + Formspree (optionnel).

---

## Prérequis

- **Node.js** 18+ recommandé (minimum 14+) — [nodejs.org](https://nodejs.org/)
- **Python 3** — pour servir les fichiers en HTTP en local (voir ci-dessous)

---

## Installation

```bash
cd Portfolio
npm install
```

### Dépannage npm (certificat TLS)

Si `npm install` affiche **`UNABLE_TO_VERIFY_LEAF_SIGNATURE`** ou *unable to verify the first certificate*, le registre npm n’est pas validé (réseau d’entreprise, proxy SSL, antivirus, etc.). Pistes : autre réseau, VPN coupé, variable **`NODE_EXTRA_CA_CERTS`** vers le PEM racine fourni par l’IT. Tant que `npm install` échoue, **`npm run build`** ne pourra pas installer `clean-css` / `uglify-js`.

Autres échecs d’install : supprimer `node_modules` (et éventuellement le lockfile si tu en utilises un), puis relancer `npm install`.

---

## Développement

Les sources sont à la **racine du dépôt** (il n’y a **pas** de dossier `src/`).

### Watch (rebuild `dist/`)

```bash
npm run watch
```

Surveille notamment `style.css`, `styles/`, `js/`, `assets/`, `partials/` et les six pages HTML, puis relance le build.

### Serveur local — sources (dev)

Les partials passent par `fetch` : il faut un **serveur HTTP** (pas d’ouverture en `file://`).

```bash
npx serve .
```

Ou Live Server sur le dossier du projet.

### Serveur local — après build (`dist/`)

```bash
npm run build
cd dist
python3 -m http.server 8000
```

Puis **http://localhost:8000**. Sous Windows, souvent `python -m http.server 8000` si `python3` est absent.

Le script npm **`npm run serve`** exécute `python3 -m http.server 8000` depuis le répertoire **courant** : pour prévisualiser le build, lance-le **depuis `dist/`** (ou utilise `npx serve dist` depuis la racine).

**Combiné** : terminal 1 `npm run watch`, terminal 2 `cd dist && python3 -m http.server 8000` (rafraîchir le navigateur après chaque build).

---

## Build production

```bash
npm run build
```

Sortie **`dist/`** :

- **CSS** : un seul `dist/style.css` (minifié, `@import` locaux inlinés)
- **JS** : tous les fichiers sous `js/` minifiés, **mêmes noms** (`main.js`, `modules/*.js`, etc.) pour garder les imports ES modules
- **Images** : PNG/JPEG dans `assets/` optimisés + variantes `.webp` dans `dist/assets/`
- **Copie** : HTML, `partials/`, `previews_data.js` (minifié si possible), `favicon.ico` s’il existe

### Arborescence `dist/` (réelle)

```
dist/
├── index.html
├── projets.html
├── competences.html
├── parcours.html
├── contact.html
├── dojo.html
├── style.css              # bundle minifié (pas de sous-dossier styles/)
├── js/
│   ├── main.js
│   ├── config.js
│   ├── modules/
│   └── utils/
├── assets/
│   ├── og.png / og.webp   # si présent à la source
│   ├── previews_data.js
│   └── …
└── partials/
    ├── nav.html
    ├── footer.html
    └── …
```

Déploiement : publier la racine **`dist/`** (GitHub Pages, Netlify, etc.).

---

## Pages

| Fichier | Contenu |
|--------|---------|
| `index.html` | Accueil (HOME) |
| `projets.html` | Projets (WORK) + modale |
| `dojo.html` | Dojo |
| `competences.html` | Compétences (STATS) |
| `parcours.html` | Parcours (STORY) |
| `contact.html` | Contact + formulaire |

Partials (nav, footer, marquee, CRT, popup score) : chargés par `js/modules/partials.js`.

---

## Formulaire — Formspree

1. Créer un compte / formulaire sur [formspree.io](https://formspree.io) et récupérer l’URL du type `https://formspree.io/f/XXXXXXX`.
2. Dans **`contact.html`** (à la racine), sur `<form id="js-formulaire">`, ajouter :

```html
<form id="js-formulaire" data-formspree="https://formspree.io/f/XXXXXXX" …>
```

3. Sans `data-formspree`, le script utilise le fallback **`mailto:`** (email dans `js/config.js` → `CONFIG.CONTACT`).

4. Tester avec un serveur HTTP sur `contact.html` et vérifier la console (F12) en cas d’échec.

---

## Déployer (GitHub Pages)

### Manuel

```bash
npm run build
# Publier le contenu de dist/ (branche gh-pages ou dossier /docs selon ton réglage Pages)
git add dist && git commit -m "Deploy" && git push
```

Configurer **Pages** pour servir `dist/` (ou la branche générée).

### Automatique (GitHub Actions)

Un workflow `.github/workflows/deploy.yml` est fourni : à chaque push sur `main`, Node 18, `npm install`, `npm run build`, puis publication de **`dist/`** avec [peaceiris/actions-gh-pages v3](https://github.com/peaceiris/actions-gh-pages). Vérifier dans **Settings → Pages** que la source correspond (souvent branche `gh-pages`). Pour un domaine perso, renseigner `cname` dans le workflow (voir commentaire dans le fichier).

---

## Performance

Les gains (tailles, score Lighthouse) **dépendent** du contenu réel (images data-URL dans `previews_data.js`, etc.). Mesure locale recommandée : DevTools → Lighthouse après `npm run build` et test sur `dist/`.

---

## Structure du dépôt (racine)

```
.
├── *.html
├── style.css                 # agrégateur @import
├── styles/                   # tokens, reset, layout, components/, pages/
├── js/
│   ├── main.js
│   ├── config.js
│   ├── modules/
│   └── utils/
├── partials/
├── assets/                   # og.png, previews_data.js, …
├── build.js
├── package.json
└── README.md
```

---

## SEO & aperçus projets

- Métas par page ; image OG : `assets/og.png`.
- `js/modules/meta.js` : canonical, `og:url`, URLs absolues pour les images OG si besoin.
- Modale projets : `assets/previews_data.js` (`IMG`) + `js/config.js` (`CONFIG.PROJETS`) + `js/modules/modal.js`.

---

## Dépannage

| Problème | Piste |
|----------|--------|
| `npm install` / certificat | Section TLS ci-dessus |
| `Python not found` au `serve` | Windows : `python` ou `py` ; macOS : `brew install python3` |
| Images non optimisées | Fichiers **directement dans `assets/`** (jpg/png), pas un sous-dossier `images/` obligatoire |
| Formspree ne reçoit rien | Vérifier `data-formspree`, réponse réseau dans l’onglet Network |

---

## Licence

MIT — utilisation libre.

---

## Pistes d’évolution

- Déployer sur GitHub Pages et valider les URLs en production
- Mesurer Lighthouse sur `dist/`
- Analytics, ESLint / tests si le projet grossit
