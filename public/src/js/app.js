let deferredPrompt

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => console.log('SW registered!'));
}

window.addEventListener('beforeinstallprompt', e => {
  console.log('Beforeinstallprompt fired');
  e.preventDefault();
  deferredPrompt = e;
  return false;
});