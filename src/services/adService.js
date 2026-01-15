const { getDb } = require('../config/firebase');
const walletService = require('./walletService');

exports.createAd = async (adData) => {
    const db = getDb(); 

    const adRef = db.collection('ads').doc();

    const newAd = {
        id: adRef.id,
        title: adData.title,
        description: adData.description,
        mediaUrl: adData.mediaUrl,
        mediaType: adData.mediaType,
        pointReward: adData.pointReward,
        timerDuration: adData.timerDuration || 15,
        createdAt: new Date().toISOString(),
        active: true
    };

    await adRef.set(newAd);
    return newAd;
};

exports.fetchAds = async () => {
    const db = getDb(); 

    const snapshot = await db
        .collection('ads')
        .where('active', '==', true)
        .limit(20)
        .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => doc.data());
};

exports.markAdComplete = async (userId, adId) => {
    const db = getDb(); 

    const adDoc = await db.collection('ads').doc(adId).get();

    if (!adDoc.exists) {
        throw new Error('Ad not found');
    }

    const adData = adDoc.data();
    const reward = adData.pointReward || 0;

    // Save view
    await db.collection('ad_views').add({
        userId,
        adId,
        timestamp: new Date().toISOString(),
        reward
    });

    // Update wallet
    const newBalance = await walletService.addPoints(
        userId,
        reward,
        `Watched Ad: ${adData.title}`
    );

    return {
        success: true,
        reward,
        newBalance
    };
};
