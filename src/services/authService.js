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
            isBlocked: false
        };

        await userRef.set(newUser);
        return newUser;
    }

    const userData = userDoc.data();

    if (userData.isBlocked) {
        throw new Error("User account is blocked");
    }

    return userData;
};

exports.getUserProfile = async (uid) => {
    const db = getDb();
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
        throw new Error("User not found");
    }

    return userDoc.data();
};

exports.getAllUsers = async () => {
    const db = getDb();
    const snapshot = await db.collection("users").get();

    return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    }));
};

exports.updateUserStatus = async (uid, isBlocked) => {
    const db = getDb();

    await db.collection("users").doc(uid).update({
        isBlocked: isBlocked
    });

    return { success: true };
};

// Make user ADMIN (manual or super-admin only)

exports.makeAdmin = async (uid) => {
    const db = getDb();

    await db.collection("users").doc(uid).update({
        role: "admin"
    });

    return { success: true, message: "User promoted to admin" };
};
