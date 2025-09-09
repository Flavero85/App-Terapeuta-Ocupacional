// ATUALIZAÇÃO CRÍTICA: Versão do cache incrementada para forçar a atualização do app.
const CACHE_NAME = 'app-to-cache-v28';
// Lista de arquivos e recursos essenciais para o funcionamento offline
const URLS_TO_CACHE = [
  './',
  'index.html',
  'add-patient.html',
  'patient-details.html',
  'notes.html',
  'schedule.html',
  'script.js',
  'manifest.json',
  'icon-192.jpg',
  'icon-512.jpg',
  'logo2.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache v28 aberto e arquivos sendo adicionados.');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim());
    })
  );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') { return; }
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

