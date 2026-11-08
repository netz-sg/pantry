/* Pantry Service Worker
   Seiten: erst Netz, bei Ausfall die zuletzt gespeicherte Version.
   Einkaufsliste und Vorrat sind damit auch ohne Empfang im Laden lesbar.
   Statische Dateien: aus dem Cache, im Hintergrund aktualisiert. */
const VERSION = 'pantry-v2-2';
const PAGES = 'pages-' + VERSION;
const ASSETS = 'assets-' + VERSION;
const OFFLINE_FIRST = ['/shopping', '/pantry', '/', '/plan'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(OFFLINE_FIRST).catch(() => undefined)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/auth')) return;

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req);
        const net = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
        return hit || net;
      }),
    );
    return;
  }

  if (req.mode === 'navigate' || url.pathname.startsWith('/api/v1/shopping') || url.pathname.startsWith('/api/v1/pantry') || url.pathname.startsWith('/media/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/shopping')) || Response.error()),
    );
  }
});

self.addEventListener('push', (event) => {
  let data = { title: 'Pantry', body: '', url: '/' };
  try {
    data = Object.assign(data, event.data ? event.data.json() : {});
  } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url: data.url } }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((list) => {
      for (const c of list) if ('focus' in c) return c.navigate(url).then((w) => w && w.focus());
      return self.clients.openWindow(url);
    }),
  );
});
