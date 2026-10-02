const CACHE_NAME = 'PB124_OFFLINE_SHELL_CALLOUT10_20261001_223237';
const BASE = '/antarctic-maritime-observation-hub/';
const OFFLINE_PAGE = BASE + 'peaceboat/index.html';
const PRECACHE = ["/antarctic-maritime-observation-hub/","/antarctic-maritime-observation-hub/","peaceboat/","/antarctic-maritime-observation-hub/404.html","/antarctic-maritime-observation-hub/index.html","/antarctic-maritime-observation-hub/pb124.webmanifest","/antarctic-maritime-observation-hub/assets/pb124-public-DIzLlwMT.js","/antarctic-maritime-observation-hub/assets/pb124-public-MrDZzuc6.css","/antarctic-maritime-observation-hub/assets/rolldown-runtime-D9-fqq9M.js","/antarctic-maritime-observation-hub/assets/vendor-icons-B3GKFMnA.js","/antarctic-maritime-observation-hub/assets/vendor-maplibre-BRUJjZdC.js","/antarctic-maritime-observation-hub/assets/vendor-maplibre-CKRTiAqP.css","/antarctic-maritime-observation-hub/assets/vendor-react-core-B92jqjlY.js","/antarctic-maritime-observation-hub/assets/vendor-turf-dVHIkDg_.js","/antarctic-maritime-observation-hub/fonts/DMSerifDisplay-Regular.woff2","/antarctic-maritime-observation-hub/fonts/IBMPlexMono-Medium.woff2","/antarctic-maritime-observation-hub/fonts/IBMPlexMono-Regular.woff2","/antarctic-maritime-observation-hub/fonts/JetBrainsMono-Medium.woff2","/antarctic-maritime-observation-hub/fonts/JetBrainsMono-Regular.woff2","/antarctic-maritime-observation-hub/fonts/Poppins-Bold.woff2","/antarctic-maritime-observation-hub/fonts/Poppins-Medium.woff2","/antarctic-maritime-observation-hub/fonts/Poppins-Regular.woff2","/antarctic-maritime-observation-hub/fonts/Poppins-SemiBold.woff2","/antarctic-maritime-observation-hub/fonts/SourceSans3-Variable.woff2","/antarctic-maritime-observation-hub/fonts/SourceSerif4-Variable.woff2","/antarctic-maritime-observation-hub/peaceboat/index.html"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('PB124_OFFLINE_SHELL_') && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }
  if(!url.pathname.startsWith(BASE)) return;

  if(request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () =>
          (await caches.match(request, {ignoreSearch:true})) ||
          (await caches.match(OFFLINE_PAGE, {ignoreSearch:true})) ||
          (await caches.match(BASE + 'index.html', {ignoreSearch:true}))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request, {ignoreSearch:true})
      .then((cached) => cached || fetch(request).then((response) => {
        if(response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }))
  );
});