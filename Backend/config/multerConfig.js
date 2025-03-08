const multer = require('multer')
const  firebaseStorage  = require('multer-firebase-storage')
const firebase = require('./firebaseConfig')
const  serviceAccount = require('../rescuelinkcodedurantham-firebase-adminsdk-fbsvc-4f113acf5b.json')

const storage = firebaseStorage({
    credentials: firebase.credential.cert(serviceAccount),
    bucketName: 'rescuelinkcodedurantham.firebasestorage.app',
    unique: true,
})

const upload = multer({
    storage: storage,
})

module.exports = upload;