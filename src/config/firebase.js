const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../../serviceAccountKey.json");

let db;

const initializeFirebase = () => {
    if (!admin.apps.length) {
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        
        db = getFirestore(app, "advertise");

        console.log("Firebase Admin initialized with database: advertise");
    }
};

const getDb = () => db;

module.exports = { admin, initializeFirebase, getDb };
