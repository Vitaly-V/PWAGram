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
    actions: [
      {action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
      {action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
    ]
  };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(swr => swr.showNotification('Successfully subscribed!', options));
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  let reg;
  navigator.serviceWorker.ready
    .then(swr => {
      reg = swr;
      return swr.pushManager.getSubscription();
    })
    .then(sub => {
      if (sub === null) {
        const vapidPublicKey = 'BFhYh2OM1otwR-aN3OG336gwzFV76yIE2Ayt7wCAqmrmtMUCGBOJir2hAOERDJGns6qoYwhxpuNyt9JsqDlJSsY';
        const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey

        });
      } else {

      }
    })
    .then(newSub => {
      return fetch('https://pwgram-3056c.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newSub)
      });
    })
    .then(res => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(err => console.log(err));
}

function askForNotificationPermission() {
  Notification.requestPermission(result => {
    console.log('User choise', result);
    if (result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
      //displayConfirmNotification();
    }
  })
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}