const { getDb } = require('../config/firebase');

exports.getWallet = async (userId) => {
    const db = getDb();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    const balance = userDoc.data().walletBalance || 0;

    const txnSnapshot = await db
        .collection('transactions')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

    const transactions = txnSnapshot.docs.map(doc => ({
        id: doc.id,
        type: doc.data().type === 'credit' ? "EARNED" : "REDEEMED",
        amount: doc.data().amount,
        description: doc.data().description,
        timestamp: doc.data().timestamp
    }));

    return {
        balance,
        transactions
    };
};

/**
 * Get only balance (keep for reuse)
 */
exports.getBalance = async (userId) => {
    const db = getDb();

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return 0;
    return userDoc.data().walletBalance || 0;
};

/**
 * Add points
 */
exports.addPoints = async (userId, amount, description) => {
    const db = getDb();
    const userRef = db.collection('users').doc(userId);

    return await db.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) throw new Error('User does not exist');

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

/**
 * Redeem points
 */
exports.redeemPoints = async (userId, amount, paymentMethod, paymentDetails) => {
    const db = getDb();
    const userRef = db.collection('users').doc(userId);

    return await db.runTransaction(async (t) => {
        const doc = await t.get(userRef);
        if (!doc.exists) throw new Error('User does not exist');

        const currentBalance = doc.data().walletBalance || 0;
        if (currentBalance < amount) {
            throw new Error('Insufficient balance');
        }

        const newBalance = currentBalance - amount;
        t.update(userRef, { walletBalance: newBalance });

        // redemption request
        const requestRef = db.collection('redemption_requests').doc();
        t.set(requestRef, {
            userId,
            amount,
            paymentMethod,
            paymentDetails,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        // transaction log
        const txnRef = db.collection('transactions').doc();
        t.set(txnRef, {
            userId,
            amount: -amount,
            type: 'debit',
            description: 'Redemption Request',
            timestamp: new Date().toISOString()
        });

        return {
            success: true,
            newBalance,
            message: 'Redemption request submitted'
        };
    });
};
