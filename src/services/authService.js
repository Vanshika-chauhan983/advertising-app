const { getDb } = require("../config/firebase");

exports.loginWithToken = async (decodedToken) => {
    const db = getDb(); 

    const { uid, phone_number, email } = decodedToken;
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        const newUser = {
            uid,
            phone_number: phone_number || null,
            email: email || null,
            createdAt: new Date().toISOString(),
            walletBalance: 0,
            role: "user",
        };

        await userRef.set(newUser);
        return newUser;
    }

    return userDoc.data();
};

exports.getUserProfile = async (uid) => {
    const db = getDb(); 

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    return userDoc.data();
};
