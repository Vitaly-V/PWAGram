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
  })
});

workboxSW.precache([]);