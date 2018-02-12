importScripts('workbox-sw.prod.v2.1.2.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts',
    cacheExpiration: {
      cacheEntries: 3,
      maxAgeSeconds: 60 * 60 *24 * 30
    }
  })
);

workboxSW.router.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'material-css',
  })
);

workboxSW.router.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, 
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: 'post-images',
  })
);

workboxSW.router.registerRoute('https://pwgram-3056c.firebaseio.com/posts.json', args => {
  return fetch(args.event.request).then(res => {
    const clonedRes = res.clone();
    clearAllData('posts')
      .then(() => clonedRes.json())
      .then(data => {
        for (const key in data) {
          writeData('posts', data[key]);
        }
      });
    return res;
  });
});

workboxSW.router.registerRoute(routeData => {
  return (routeData.event.request.headers.get('accept').includes('text/html'));
}, args => {
  return caches.match(args.event.request).then(response => {
    console.log('RES');
    if (response) {
      return response;
    } else {
      return fetch(args.event.request)
        .then(res => {
          return caches.open('dynamic').then(cache => {
            cache.put(args.event.request.url, res.clone());
            return res;
          });
        })
        .catch(err => caches.match('/offline.html').then(res => res));
    }
  })
});

workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "help/index.html",
    "revision": "2488969946fe0e8b3568d063cecd622c"
  },
  {
    "url": "index.html",
    "revision": "7a9b31df618f2a85d61780e19a23e8d8"
  },
  {
    "url": "manifest.json",
    "revision": "9c191b66925fd0a00a9fcfc47907daf8"
  },
  {
    "url": "offline.html",
    "revision": "45352e71a80a5c75d25e226e7330871b"
  },
  {
    "url": "service-worker.js",
    "revision": "f550b58996c703926c54d1e4ba0a597b"
  },
  {
    "url": "src/css/app.css",
    "revision": "f27b4d5a6a99f7b6ed6d06f6583b73fa"
  },
  {
    "url": "src/css/feed.css",
    "revision": "9b6c5f27a295d807089e208db5ce6ace"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/icons/app-icon-144x144.png",
    "revision": "83011e228238e66949f0aa0f28f128ef"
  },
  {
    "url": "src/images/icons/app-icon-192x192.png",
    "revision": "f927cb7f94b4104142dd6e65dcb600c1"
  },
  {
    "url": "src/images/icons/app-icon-256x256.png",
    "revision": "86c18ed2761e15cd082afb9a86f9093d"
  },
  {
    "url": "src/images/icons/app-icon-384x384.png",
    "revision": "fbb29bd136322381cc69165fd094ac41"
  },
  {
    "url": "src/images/icons/app-icon-48x48.png",
    "revision": "45eb5bd6e938c31cb371481b4719eb14"
  },
  {
    "url": "src/images/icons/app-icon-512x512.png",
    "revision": "d42d62ccce4170072b28e4ae03a8d8d6"
  },
  {
    "url": "src/images/icons/app-icon-96x96.png",
    "revision": "56420472b13ab9ea107f3b6046b0a824"
  },
  {
    "url": "src/images/icons/apple-icon-114x114.png",
    "revision": "74061872747d33e4e9f202bdefef8f03"
  },
  {
    "url": "src/images/icons/apple-icon-120x120.png",
    "revision": "abd1cfb1a51ebe8cddbb9ada65cde578"
  },
  {
    "url": "src/images/icons/apple-icon-144x144.png",
    "revision": "b4b4f7ced5a981dcd18cb2dc9c2b215a"
  },
  {
    "url": "src/images/icons/apple-icon-152x152.png",
    "revision": "841f96b69f9f74931d925afb3f64a9c2"
  },
  {
    "url": "src/images/icons/apple-icon-180x180.png",
    "revision": "2e5e6e6f2685236ab6b0c59b0faebab5"
  },
  {
    "url": "src/images/icons/apple-icon-57x57.png",
    "revision": "cc93af251fd66d09b099e90bfc0427a8"
  },
  {
    "url": "src/images/icons/apple-icon-60x60.png",
    "revision": "18b745d372987b94d72febb4d7b3fd70"
  },
  {
    "url": "src/images/icons/apple-icon-72x72.png",
    "revision": "b650bbe358908a2b217a0087011266b5"
  },
  {
    "url": "src/images/icons/apple-icon-76x76.png",
    "revision": "bf10706510089815f7bacee1f438291c"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.js",
    "revision": "123ca0fc25a348088023ae923fd0b1e0"
  },
  {
    "url": "src/js/feed.js",
    "revision": "222d4efc067dcc49eb93ffeae8dcdd66"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "97875bdf39cb9e183684ff0913574ea4"
  },
  {
    "url": "sw-base.js",
    "revision": "386c770a4eab128a2b2111ea17d524b5"
  },
  {
    "url": "sw.js",
    "revision": "c4eaccd4f1c3cb12ace74477fa41ed30"
  },
  {
    "url": "workbox-sw.prod.v2.1.2.js",
    "revision": "685d1ceb6b9a9f94aacf71d6aeef8b51"
  }
]);

self.addEventListener('sync', event => {
  console.log('[SW] Background syncing', event);
  if (event.tag === 'sync-new-post') {
    console.log('[SW] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts').then(data => {
        for (const dt of data) {
          const postData = new FormData();
          postData.append('id', dt.id);
          postData.append('title', dt.title);
          postData.append('location', dt.location);
          postData.append('rawLocationLat', dt.rawLocation.lat);
          postData.append('rawLocationLng', dt.rawLocation.lng);
          postData.append('file', dt.picture, dt.id + '.png');
          fetch('https://us-central1-pwgram-3056c.cloudfunctions.net/storePostData', {
            method: 'POST',
            body: postData,
          }).then(res => {
            console.log('Sent data!', res);
            if (res.ok) {
              res.json()
              .then(resData => {
                deleteItemFromData('sync-posts', resData.id); 
              });
            }
          })
          .catch(err => console.log('Error while sending data', err));
        }
      })
    );
  }
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  console.log(notification);

  if (action === 'confirm') {
    console.log('Confirm was chosen');
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
        .then(clis => {
          const client = clis.find(c => c.visibilityState === 'visible');
          if (client !== undefined) {
            client.navigate(notification.data.url);
          } else {
            clients.openWindow(notification.data.url);
          }
        })
    )
  }
  notification.close();
});

self.addEventListener('notificationclose', event => {
  console.log('Notification was closed', event);
});

self.addEventListener('push', event => {
  console.log('Push Notification recived', event);
  let data = {title: 'New!', content: 'Something new happened!', openUrl: '/'};
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.conten,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});