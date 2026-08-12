/* Coach Card offline cache — bump the version when files change */
var CACHE = 'chaos-coordinator-v86';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './jsqr.js', './halfrack/', './halfrack/index.html', './halfrack/manifest.webmanifest', './halfrack/icon-192.png', './halfrack/icon-512.png', './halfrack/apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
/* serve from cache instantly, refresh the cache in the background */
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function(cached){
    var fresh = fetch(e.request).then(function(res){
      if(res && res.ok){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){ return cached; });
    return cached || fresh;
  }));
});
