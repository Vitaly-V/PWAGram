let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  const options = {
    body: 'You successfully subscribed through SW!',
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/sf-boat.jpg',
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification',
    renotify: true,
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(swr => swr.showNotification('Successfully subscribed!', options));
  }
}

function askForNotificationPermission() {
  Notification.requestPermission(result => {
    console.log('User choise', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      displayConfirmNotification();
    }
  })
}

if ('Notification' in window) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}