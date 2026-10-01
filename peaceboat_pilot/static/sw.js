const CACHE="olea-pb124-v1";const ASSETS=["/peaceboat","/peaceboat/static/styles.css","/peaceboat/static/app.js","/peaceboat/manifest.webmanifest"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(new URL(e.request.url).pathname.startsWith("/api/"))return;
e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("/peaceboat"))))});