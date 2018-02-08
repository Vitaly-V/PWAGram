var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(() => (createPostArea.style.transform = 'translateY(0)'), 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  /*   if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(i => i.unregister()));
  }
*/
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  //createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
/* 
function onSaveButtonClicked(e) {
  console.log('Clicked');
  if ('caches' in window){
    console.log('inif');
    caches.open('user-requested')
      .then(cache => {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
} */

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = '#FFF';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  /*   const cardSaveButton = document.createElement('button');
  cardSaveButton.textContent = 'Save';
  cardSaveButton.addEventListener('click', onSaveButtonClicked);
  cardSupportingText.appendChild(cardSaveButton); */
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  if (data) {
    data.map(i => createCard(i));
  }
}

const url = 'https://pwgram-3056c.firebaseio.com/posts.json';
let networkDataRecived = false;

fetch(url)
  .then(res => {
    return res.json();
  })
  .then(data => {
    networkDataRecived = true;
    console.log('From web', data);
    clearCards();
    const convData = data ? Object.values(data) : data;
    updateUI(convData);
  });

if ('indexedDB' in window) {
  readAllData('posts').then(data => {
    if (!networkDataRecived) {
      console.log('From cache', data);
      updateUI(data);
    }
  });
}

function sendData() {
  fetch('https://us-central1-pwgram-3056c.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://firebasestorage.googleapis.com/v0/b/pwgram-3056c.appspot.com/o/sf-boat.jpg?alt=media&token=28794078-e92d-417b-8eb4-5c49b07fddb0',
    }),
  }).then(res => {
    console.log('Sent data!', res);
    updateUI();
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      };
      writeData('sync-posts', post)
        .then(() => sw.sync.register('sync-new-post'))
        .then(() => {
          const snackbarContainer = document.querySelector('#confirmation-toast');
          const data = { message: 'Your Posw was saved for syncing!' };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(err => console.log(err));
    });
  } else {
    sendData();
  }
});
