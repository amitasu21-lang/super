/* סופר – service worker: שומר את קבצי האפליקציה כדי שתיפתח מהר וגם בלי קליטה */
const CACHE = 'super-v8';
const SHELL = [
  './', 'index.html', 'styles.css', 'app.js', 'catalog.js', 'manifest.webmanifest',
  'app-192.png', 'app-512.png', 'apple-touch-icon.png', 'logo.svg',
  'amit.png', 'noga.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // הנתונים עצמם (Google) תמיד מהרשת
  if (url.origin !== self.location.origin && !url.host.includes('fonts.g')) return;
  // קבצי האפליקציה: קודם רשת (כדי לקבל עדכונים), ואם אין קליטה – מהמטמון
  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  );
});
