const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

let db;

const initializeFirebase = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        // 👇 CONNECT TO YOUR REAL DATABASE
        db = admin.firestore({ databaseId: "advertise" });

        console.log("Firebase Admin initialized with database: advertise");
    }
};

const getDb = () => db;

module.exports = { admin, initializeFirebase, getDb };
