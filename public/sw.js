importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v11';
const CACHE_DYNAMIC_NAME = 'dynamic-v3';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log('[Service Worker] Precaching App Shell');
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(k => {
          if (k !== CACHE_STATIC_NAME && k !== CACHE_DYNAMIC_NAME) {
            console.log('[SW] Removing old cache. ', k);
            return caches.delete(k);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

/* self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              caches.open(CACHE_DYNAMIC_NAME)
                .then((cache) => {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(e => {
              return caches.open(CACHE_STATIC_NAME)
                .then(cache => cache.match('/offline.html'));
            });
        }
      })
  );
}); */

// Cache only
/* self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
  );
}); */

// Network only
/* self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.fetch(event.request)
  );
});

function trimCache(cacheName, maxItems) {
  caches
    .open(cacheName)
    .then(cache => {
      return cache.keys().then(keys => {
        if (keys.length > maxItems) {
          cache.delete(keys[0]).then(trimCache(caches, maxItems));
        }
      })
    });
}
*/

self.addEventListener('fetch', event => {
  const url = 'https://pwgram-3056c.firebaseio.com/posts.json';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(res => {
        const clonedRes = res.clone();
        clearAllData('posts')
          .then(() => clonedRes.json())
          .then(data => {
            for (const key in data) {
              writeData('posts', data[key]);
            }
          });
        return res;
      })
    );
  } else if (STATIC_FILES.includes(event.request.url)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                //trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME).then(cache => {
                if (event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});

self.addEventListener('sync', event => {
  console.log('[SW] Background syncing', event);
  if (event.tag === 'sync-new-post') {
    console.log('[SW] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts').then(data => {
        for (const dt of data) {
          fetch('https://pwgram-3056c.firebaseio.com/posts.json', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              id: dt.id,
              title: dt.title,
              location: dt.location,
              image:
                'https://firebasestorage.googleapis.com/v0/b/pwgram-3056c.appspot.com/o/sf-boat.jpg?alt=media&token=28794078-e92d-417b-8eb4-5c49b07fddb0',
            }),
          }).then(res => {
            console.log('Sent data!', res);
            if (res.ok) {
              deleteItemFromData('sync-posts', dt.id); // Isn't working correctly!
            }
          })
          .catch(err => console.log('Error while sending data', err));
        }
      })
    );
  }
});
