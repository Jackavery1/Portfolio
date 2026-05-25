# Portfolio Arcade CRT

Portfolio personnel de **Joris Martinez** (développeur web junior) — thème arcade rétro, effet CRT, système de score, navigation clavier et modales projets.

**Stack** : HTML5 · CSS modulé (`styles/`, agrégateur `style.css`) · JavaScript ES6 modules (`js/`) · build Node (`build.js`) · déploiement GitHub Pages (workflow fourni).

---

## Prérequis

- **Node.js** 18+ recommandé (minimum 14+) — [nodejs.org](https://nodejs.org/)
- **Python 3** (ou `python` sous Windows) — pour servir `dist/` en HTTP local

---

## Installation

```bash
cd Portfolio
npm install
```

### Dépannage npm (certificat TLS)

Si `npm install` affiche **`UNABLE_TO_VERIFY_LEAF_SIGNATURE`** ou *unable to verify the first certificate*, le registre npm n’est pas validé (réseau d’entreprise, proxy SSL, antivirus, etc.). Pistes : autre réseau, VPN coupé, variable **`NODE_EXTRA_CA_CERTS`** vers le PEM racine fourni par l’IT. Tant que `npm install` échoue, **`npm run build`** ne pourra pas installer `clean-css`, `uglify-js` ni les plugins `imagemin`.

Autres échecs d’install : supprimer `node_modules` (et éventuellement le lockfile), puis relancer `npm install`.

---

## Développement

Les sources sont à la **racine du dépôt** (pas de dossier `src/`).

### Watch (rebuild `dist/`)

```bash
npm run watch
```

Surveille `style.css`, `styles/`, `js/`, `assets/`, `partials/` et les **7 pages HTML**, puis relance le build.

### Serveur local — sources (dev)

Les partials sont chargés via `fetch` : il faut un **serveur HTTP** (pas d’ouverture en `file://`).

```bash
npx serve .
```

Ou l’extension Live Server sur le dossier du projet.

### Serveur local — après build (`dist/`)

```bash
npm run build
cd dist
python3 -m http.server 8000
```

Puis **http://localhost:8000**. Sous Windows, souvent `python -m http.server 8000` si `python3` est absent.

Le script **`npm run serve`** lance `python3 -m http.server 8000` depuis le répertoire **courant** : pour prévisualiser le build, exécute-le **depuis `dist/`** (ou `npx serve dist` depuis la racine).

**Combiné** : terminal 1 `npm run watch`, terminal 2 `cd dist && python3 -m http.server 8000` (rafraîchir le navigateur après chaque build).

---

## Build production

```bash
npm run build
```

Sortie **`dist/`** :

| Étape | Détail |
|--------|--------|
| **HTML** | Copie des 7 pages listées dans `build.js` |
| **CSS** | Un seul `dist/style.css` (minifié, `@import` locaux inlinés) |
| **JS** | Tous les fichiers sous `js/` minifiés, **mêmes chemins** (imports ES modules inchangés) |
| **Images** | PNG/JPEG dans `assets/` optimisés + variantes `.webp` dans `dist/assets/` |
| **Autres** | `assets/previews/`, `favicon.ico` s’il existe |

### Arborescence `dist/` (réelle)

```
dist/
├── index.html
├── projets.html
├── competences.html
├── parcours.html
├── contact.html
├── dojo.html
├── mentions-legales.html
├── style.css
├── js/
│   ├── main.js
│   ├── config.js
│   ├── modules/
│   └── utils/
├── assets/
│   ├── og.png / og.webp
│   └── previews/
```

Les partials sont **inlinés** dans chaque page HTML de `dist/` (pas de dossier `partials/` en prod).

Déploiement : publier la racine **`dist/`** (GitHub Pages, Netlify, etc.).

---

## Pages

| Fichier | Rôle |
|--------|------|
| `index.html` | Accueil (HOME) |
| `projets.html` | Projets (WORK) + modale détail |
| `competences.html` | Compétences (STATS) — barres animées |
| `parcours.html` | Parcours (STORY) |
| `contact.html` | Contact + formulaire |
| `dojo.html` | Page bonus (lien depuis `projets.html`, hors menu principal) |
| `mentions-legales.html` | Mentions légales, RGPD, propriété intellectuelle |

**Partials** (injectés par `js/modules/partials.js`) : navigation, pied de page, bandeau marquee, overlay CRT, popup high score.

**Navigation clavier** (← / →) : enchaîne les pages de `CONFIG.NAVIGATION.ORDER` dans `js/config.js` (`index` → `projets` → `competences` → `parcours` → `contact`). `dojo.html` et `mentions-legales.html` sont hors de cet ordre.

---

## Expérience arcade (score & easter eggs)

- **Score** (`sessionStorage`, affiché dans la nav) : plafond **9999**, format `000000`.
- **Bonus** (`js/modules/meta.js`) : +200 à la première visite d’une page, points sur cartes projets / dojo, survol projet, lien GitHub, etc.
- **Popup high score** : à l’atteinte de 9999 (`partials/popup-highscore.html`).
- **Code Konami** : séquence définie dans `CONFIG.KONAMI` — active la classe `konami-actif` sur le `body`, fanfare Web Audio, score max si besoin.
- **Sons** : bips via Web Audio API (`js/modules/audio.js`) — menu burger, navigation clavier.
- **Animations** : barres de progression / stats au chargement (`js/modules/animations.js`, `data-section-id` sur le `body`).

---

## JavaScript (modules)

| Fichier | Rôle |
|--------|------|
| `main.js` | Orchestration au `DOMContentLoaded` |
| `config.js` | Constantes (sélecteurs, projets, partials, navigation, Konami) |
| `modules/partials.js` | Chargement HTML des partials + lien actif |
| `modules/navigation.js` | Menu burger, flèches gauche/droite entre pages |
| `modules/modal.js` | Modale projets (clavier + clic) |
| `modules/contact-form.js` | Formulaire contact (Formspree ou `mailto:`) |
| `modules/score.js` | Lecture/écriture score, popup HS |
| `modules/meta.js` | Canonical, OG absolus, bonus score |
| `modules/konami.js` | Détection code Konami |
| `modules/audio.js` | Sons arcade |
| `modules/animations.js` | Animation des barres par section |
| `utils/dom.js` | Helpers DOM (`byId`, etc.) |
| `utils/focus.js` | Piège de focus modale / popup |

Données projets modale : `CONFIG.PROJETS` (`apercu`, liens) + `modal.js`. Build : URLs canoniques / Open Graph absolues injectées dans `dist/` (variable `PORTFOLIO_SITE_URL`, défaut `https://jackavery1.github.io/Portfolio`).

### Accessibilité & SEO (pages)

- **Lien d’évitement** : « Aller au contenu principal » → `#js-contenu-principal` (focus visible, `scroll-margin` sous le bandeau).
- **Titres** : un `<h1>` par page (`titre-arcade` sur l’accueil, `titre-section` ailleurs) ; sous-titres en `<h2>`.
- **Open Graph** : `og:url` + images en URL absolues en production (`build.js`) ; en dev, `meta.js` complète depuis `CONFIG.SITE_ORIGIN` ou l’URL courante.
- **Polices** : `display=swap` sur l’import Google Fonts.

---

## Formulaire — Formspree

1. Créer un formulaire sur [formspree.io](https://formspree.io) → **CAPTCHA** activé → **Custom reCAPTCHA** (clé secrète dans Formspree).
2. Créer une clé [Google reCAPTCHA](https://www.google.com/recaptcha/admin) (**v2** case à cocher ou **v3** invisible) pour ton domaine.
3. Dans **`js/config.js`** :
   - `FORMSPREE_ENDPOINT` : URL du formulaire
   - `RECAPTCHA_SITE_KEY` : clé **SITE** Google (pas la clé secrète)
   - `RECAPTCHA_VERSION` : `2` ou `3` (identique à Formspree / Google)
4. Sans `RECAPTCHA_SITE_KEY`, Formspree renvoie **403** si le CAPTCHA est activé côté dashboard.
5. Laisser `FORMSPREE_ENDPOINT` vide pour le fallback **`mailto:`**.
6. Tester en HTTP (pas `file://`) ; en prod, `npm run build` (CSP `dist/` autorise Google reCAPTCHA).

**Localhost (`127.0.0.1`)** : ajoute `127.0.0.1` et `localhost` dans Google reCAPTCHA. Sur Formspree, laisse **Restrict to Domain** vide pendant les tests locaux (sinon seul `jackavery1.github.io` est accepté). En cas de **400**, ouvre l’onglet Network → requête `mlgzkqbz` → **Response** : le JSON indique la cause (souvent reCAPTCHA secret incorrecte).

### Mesures de sécurité (front)

- **CSP** : injectée au **build** dans `dist/` uniquement (pas en dev — compatible Live Server). `frame-ancestors` nécessite un en-tête HTTP (non disponible sur GitHub Pages via meta).
- **Honeypot** : champ `_gotcha` (ignoré si rempli).
- **Rate limit** : 60 s entre deux envois (`sessionStorage`).
- **Validation** : longueurs max, email, nettoyage caractères de contrôle.
- **Coordonnées** : email / téléphone injectés en JS (`contact-coordonnees.js`) pour limiter le scraping HTML statique ; fallback `<noscript>` sur les mentions légales.

---

## Déployer (GitHub Pages)

### Automatique (recommandé)

Le workflow **`.github/workflows/deploy.yml`** : à chaque push sur `main`, Node 18 → `npm install` → `npm run build` → publication de **`dist/`** via [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages). Vérifier **Settings → Pages** (souvent branche `gh-pages`). Pour un domaine perso, décommenter `cname` dans le workflow.

### Manuel

```bash
npm run build
# Publier le contenu de dist/ (branche gh-pages ou dossier configuré dans Pages)
```

---

## Performance

Le build applique plusieurs optimisations pour la prod (`dist/`) :

| Mesure | Effet |
|--------|--------|
| **Partials inlinés** | Nav, footer, marquee, CRT et popup HS intégrés dans chaque HTML — **0 requête `fetch`** au chargement en prod |
| **JS conditionnel** | `modal.js` uniquement sur WORK ; `contact-form` / `recaptcha` uniquement sur CONTACT (imports dynamiques) |
| **CSS / JS minifiés** | Un seul `style.css` ; modules sous `js/` |
| **Preload `style.css`** | Démarrage du rendu plus tôt |
| **Polices** | Rajdhani limité à 400 et 600 ; `display=swap` |
| **Overlay CRT** | Désactivé si `prefers-reduced-motion: reduce` |

En **développement** (racine + serveur HTTP), les partials restent chargés via `fetch` (`partials.js`).

Mesure recommandée : DevTools → Lighthouse sur `dist/` après `npm run build` (mode mobile, throttling).

---

## Structure du dépôt (racine)

```
.
├── *.html                    # 7 pages
├── style.css                 # agrégateur @import
├── styles/
│   ├── tokens.css, reset.css, layout.css
│   ├── components/           # crt, nav, modal, card, form, footer
│   └── pages/                # accueil, projets, competences, …
├── js/
│   ├── main.js, config.js
│   ├── modules/
│   └── utils/
├── partials/
├── assets/                   # og.png, previews/, …
├── build.js
├── package.json
├── .github/workflows/deploy.yml
└── README.md
```

---

## SEO & partage

- Métas Open Graph / Twitter par page ; image OG : `assets/og.png`.
- `js/modules/meta.js` : `link[rel=canonical]`, `og:url`, URLs absolues pour les images OG.

---

## Dépannage

| Problème | Piste |
|----------|--------|
| `npm install` / certificat | Section TLS ci-dessus |
| Partials vides en local | Servir en HTTP (`npx serve .`), pas `file://` |
| `Python not found` au `serve` | Windows : `python` ou `py` |
| Images non optimisées | Fichiers **directement dans `assets/`** (jpg/png) |
| Formspree ne reçoit rien | Vérifier `FORMSPREE_ENDPOINT` dans `config.js`, réponse Network |
| Score ne bouge pas | `sessionStorage` — nouvelle session ou onglet privé pour retester |

---

## Licence

**Tous droits réservés** — voir le fichier [`LICENSE`](LICENSE). Le code et le design de ce portfolio ne sont pas sous licence open source ; toute réutilisation nécessite une autorisation écrite (contact dans le fichier LICENSE). Les dépendances npm restent soumises à leurs propres licences.

---

## Pistes d’évolution

- Mesures Lighthouse régulières sur `dist/`
- ESLint / tests si le projet continue de grossir
- Analytics léger si besoin en production
