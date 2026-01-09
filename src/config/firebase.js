const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

let db; 

const initializeFirebase = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        db = admin.firestore(); 
        console.log("Firebase Admin initialized");
    }
};

module.exports = { admin, initializeFirebase, getDb: () => db };
