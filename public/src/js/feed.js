const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');
let picture;
const locationBtn = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchLocation = {lat: 0, lng: 0};

locationBtn.addEventListener('click', event => {
  if (!('geolocation' in navigator)) {
    return;
  }

  let sawAlert = false;

  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition(position => {
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      fetchLocation = { lat: position.coords.latitude, lng: position.coords.longitude};
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${fetchLocation.lat},${fetchLocation.lng}&key=AIzaSyDSGMyVtibWEyMKCgsWI_I_8vLE5K0GlWQ`)
        .then(res => {
          return res.json();
        })
        .then((data) => {
          locationInput.value = data.results[0].formatted_address ? `${data.results[0].address_components[1].short_name}, ${data.results[0].address_components[3].short_name}` : 'Somewhere';
          document.querySelector('#manual-location').classList.add('is-focused');
        });
    }, err => {
      console.log(err);
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      if(!sawAlert) {
        alert(`Couldn't fetch location, please enter manually!`);
        sawAlert = true;
      }
      fetchLocation = { lat: 0, lng: 0};
    }, {timeout: 7000}
  );
})

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      })
    }
  }

  navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(err => {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click', event => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  const context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', event => {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  console.log(deferredPrompt);
  setTimeout(() => (createPostArea.style.transform = 'translateY(0)'), 1);
  initializeMedia();
  initializeLocation();
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
}

function closeCreatePostModal() {
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationLoader.style.display = 'none';
  locationBtn.style.display = 'inline';
  captureButton.style.display = 'inline';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  }
  setTimeout(() => createPostArea.style.transform = 'translateY(100vh)', 1);
}


shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

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
  const id = new Date().toISOString();
  const postData = new FormData();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchLocation.lat);
  postData.append('rawLocationLng', fetchLocation.lng);
  postData.append('file', picture, id + '.png');
  fetch('https://us-central1-pwgram-3056c.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData,
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
        picture,
        rawLocation: fetchLocation
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
