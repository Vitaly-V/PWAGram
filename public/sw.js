self.addEventListener('install', e => console.log('Installing SW ...', e));

self.addEventListener('activate', e => {
  console.log('Activating SW ...', e);
  return self.clients.claim();
});

self.addEventListener('fetch', e => {
  console.log('Fetching something ...', e);
  e.respondWith(fetch(e.request));
});