const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');
const formidable = require('formidable');
const fs = require('fs');
const os = require("os"); 
const path = require('path');
const UUID = require('uuid-v4');
const Busboy = require('busboy');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const serviceAccount = require('./pwgram-fb-key.json');

const gcconfig = {
  projectId: 'pwgram-3056c',
  keyFileneme: 'pwgram-fb-key.json',
};
const gcs = require('@google-cloud/storage')(gcconfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwgram-3056c.firebaseio.com/',
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const uuid = UUID();

    const busboy = new Busboy({ headers: request.headers });
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = {};

    // This callback will be invoked for each file uploaded
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log(`File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`);
      const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will invoked on every field detected
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
      fields[fieldname] = val;
    });

    // This callback will be invoked after all uploaded files are saved.
    busboy.on('finish', () => {
      var bucket = gcs.bucket('pwgram-3056c.appspot.com');
      bucket.upload(
        upload.file,
        {
          uploadType: 'media',
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        (err, uploadedFile) => {
          if (!err) {
            admin
              .database()
              .ref('posts')
              .push({
                id: fields.id,
                title: fields.title,
                location: fields.location,
                rawLocation: {
                  lat: fields.rawLocationLat,
                  lng: fields.rawLocationLng,
                },
                image:
                  'https://firebasestorage.googleapis.com/v0/b/' +
                  bucket.name +
                  '/o/' +
                  encodeURIComponent(uploadedFile.name) +
                  '?alt=media&token=' +
                  uuid,
              })
              .then(() => {
                webpush.setVapidDetails(
                  'mailto:test@test.com',
                  'BFhYh2OM1otwR-aN3OG336gwzFV76yIE2Ayt7wCAqmrmtMUCGBOJir2hAOERDJGns6qoYwhxpuNyt9JsqDlJSsY',
                  ''
                );
                return admin
                  .database()
                  .ref('subscriptions')
                  .once('value');
              })
              .then(subscriptions => {
                subscriptions.forEach(sub => {
                  const pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh,
                    },
                  };
                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: 'New Post',
                        content: 'New Post added!',
                        openUrl: '/',
                      })
                    )
                    .catch((err) => {
                      console.log(err);
                    });
                });
                response.status(201).json({ message: 'Data stored', id: fields.id });
              })
              .catch((err) => {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
    // a callback when it's finished.
    busboy.end(request.rawBody);
    // formData.parse(request, function(err, fields, files) {
    //   fs.rename(files.file.path, "/tmp/" + files.file.name);
    //   var bucket = gcs.bucket("YOUR_PROJECT_ID.appspot.com");
    // });
  });
});
