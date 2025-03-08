const Firebase = require('firebase-admin');
const  serviceAccount = require('../rescuelinkcodedurantham-firebase-adminsdk-fbsvc-4f113acf5b.json')

const firebase =  Firebase.initializeApp({
    credential: Firebase.credential.cert(serviceAccount),
    storageBucket: 'rescuelinkcodedurantham.firebasestorage.app'
})

module.exports = Firebase;

