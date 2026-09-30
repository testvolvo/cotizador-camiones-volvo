const CACHE_NAME="cotizador-volvo-v2-57-pwa-1";
const APP_SHELL=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./assets/plantilla_forma_pago.xlsb"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(key=>key.startsWith("cotizador-volvo-") && key!==CACHE_NAME)
          .map(key=>caches.delete(key))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);

  if(request.mode==="navigate"){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put("./index.html",copy));
          return response;
        })
        .catch(()=>caches.match("./index.html"))
    );
    return;
  }

  if(url.origin===self.location.origin){
    event.respondWith(
      caches.match(request).then(cached=>{
        const network=fetch(request)
          .then(response=>{
            if(response && response.ok){
              const copy=response.clone();
              caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
            }
            return response;
          })
          .catch(()=>cached);
        return cached || network;
      })
    );
    return;
  }

  event.respondWith(caches.match(request).then(cached=>cached || fetch(request)));
});
