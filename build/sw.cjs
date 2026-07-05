const fs = require('fs');
const path = require('path');
const { ensureDir, log, walkJsFiles } = require('./fs-utils.cjs');
const { HTML_FILES } = require('./html.cjs');
const { BASE_STYLE_FILE, PAGE_STYLE_BY_HTML } = require('./page-styles.cjs');

function listerPolicesPrecache(distDir) {
  const fontsDir = path.join(distDir, 'assets', 'fonts');
  if (!fs.existsSync(fontsDir)) return [];

  return fs
    .readdirSync(fontsDir)
    .filter((name) => name.endsWith('.woff2'))
    .map((name) => `assets/fonts/${name}`);
}

function listerPreviewsPrecache(distDir) {
  const previewsDir = path.join(distDir, 'assets', 'previews');
  if (!fs.existsSync(previewsDir)) return [];

  return fs
    .readdirSync(previewsDir)
    .filter((name) => /\.(webp|png)$/i.test(name))
    .map((name) => `assets/previews/${name}`);
}

function precacheUrls(distDir) {
  const jsFiles = walkJsFiles(path.join(distDir, 'js')).map((abs) =>
    path.relative(distDir, abs).replace(/\\/g, '/')
  );

  return [
    'offline.html',
    'styles/tokens.css',
    'styles/fonts-local.css',
    'styles/pages/offline.css',
    'manifest.webmanifest',
    'assets/favicon.png',
    'assets/apple-touch-icon.png',
    'assets/icon-192.png',
    'assets/icon-512.png',
    'assets/cv-martinez-joris.pdf',
    BASE_STYLE_FILE,
    ...jsFiles,
    ...HTML_FILES,
    ...Object.values(PAGE_STYLE_BY_HTML).map(({ outfile }) => outfile),
    ...listerPolicesPrecache(distDir),
    ...listerPreviewsPrecache(distDir),
  ];
}

function generateServiceWorker(version, distDir) {
  const cacheName = `portfolio-arcade-v${String(version).replace(/\./g, '-')}`;
  const urls = precacheUrls(distDir);

  return `'use strict';

const CACHE = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(urls, null, 2)};
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function preciserReponseNavigation(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() =>
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const offline = await chercherOffline(cache);
        if (!offline) return undefined;
        const body = await offline.text();
        return new Response(body, {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }),
    );
}

async function chercherOffline(cache) {
  const direct = await cache.match(OFFLINE_URL);
  if (direct) return direct;

  const origin = self.location.origin;
  const candidates = [OFFLINE_URL, \`/\${OFFLINE_URL}\`, \`\${origin}/\${OFFLINE_URL}\`];
  for (const candidate of candidates) {
    const match = await cache.match(candidate);
    if (match) return match;
  }

  const keys = await cache.keys();
  const offlineKey = keys.find((req) => req.url.endsWith('/offline.html'));
  return offlineKey ? cache.match(offlineKey) : undefined;
}

function preciserReponseRessource(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(preciserReponseNavigation(request));
    return;
  }

  event.respondWith(preciserReponseRessource(request));
});
`;
}

function writeServiceWorker(targetDir, version) {
  ensureDir(targetDir);
  const urls = precacheUrls(targetDir);
  fs.writeFileSync(
    path.join(targetDir, 'sw.js'),
    generateServiceWorker(version, targetDir),
    'utf8'
  );
  log(`sw.js généré (${urls.length} entrées precache)`, 'success');
}

module.exports = { writeServiceWorker, precacheUrls, generateServiceWorker };
