const { getDb } = require('../config/firebase');

exports.getBalance = async (userId) => {
    const db = getDb(); 

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return 0;
    return userDoc.data().walletBalance || 0;
};

exports.addPoints = async (userId, amount, description) => {
    const db = getDb();

    const userRef = db.collection('users').doc(userId);

    return await db.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) {
            throw new Error('User does not exist');
        }

        const newBalance = (doc.data().walletBalance || 0) + amount;

        t.update(userRef, { walletBalance: newBalance });

        const txnRef = db.collection('transactions').doc();
        t.set(txnRef, {
            userId,
            amount,
            type: 'credit',
            description,
            timestamp: new Date().toISOString()
        });

        return newBalance;
    });
};

exports.redeemPoints = async (userId, amount, paymentMethod, paymentDetails) => {
    const db = getDb(); 

    const userRef = db.collection('users').doc(userId);

    return await db.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) {
            throw new Error('User does not exist');
        }

        const currentBalance = doc.data().walletBalance || 0;
        if (currentBalance < amount) {
            throw new Error('Insufficient balance');
        }

        const newBalance = currentBalance - amount;
        t.update(userRef, { walletBalance: newBalance });

        const requestRef = db.collection('redemption_requests').doc();
        t.set(requestRef, {
            userId,
            amount,
            paymentMethod,
            paymentDetails,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        const txnRef = db.collection('transactions').doc();
        t.set(txnRef, {
            userId,
            amount: -amount,
            type: 'debit',
            description: 'Redemption Request',
            timestamp: new Date().toISOString()
        });

        return { success: true, newBalance, message: 'Redemption request submitted' };
    });
};
