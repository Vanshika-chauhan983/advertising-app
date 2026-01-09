const { db } = require('../config/firebase');
const walletService = require('./walletService');

exports.createAd = async (adData) => {
    const adRef = db.collection('ads').doc();
    const newAd = {
        id: adRef.id,
        ...adData,
        createdAt: new Date().toISOString(),
        active: true
    };
    await adRef.set(newAd);
    return newAd;
};

exports.fetchAds = async (userId) => {
    // Basic implementation: fetch all active ads
    // TODO: Implement targeting logic (city, age) and exclude already watched ads
    const snapshot = await db.collection('ads').where('active', '==', true).limit(20).get();

    if (snapshot.empty) {
        return [];
    }

    const ads = [];
    snapshot.forEach(doc => {
        ads.push(doc.data());
    });

    // Check which ads user has already seen today (skipped for MVP simplicity, can act as "views")
    return ads;
};

exports.markAdComplete = async (userId, adId) => {
    const adDoc = await db.collection('ads').doc(adId).get();
    if (!adDoc.exists) {
        throw new Error('Ad not found');
    }

    const adData = adDoc.data();
    const reward = adData.pointReward || 0;

    // Record the view
    await db.collection('ad_views').add({
        userId,
        adId,
        timestamp: new Date().toISOString(),
        reward
    });

    // Update wallet
    const newBalance = await walletService.addPoints(userId, reward, `Watched Ad: ${adData.title || adId}`);

    return { success: true, reward, newBalance };
};

