const { getDb, admin } = require('../config/firebase');
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
        active: true,
        viewCount: 0
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

    // Increment Ad viewCount
    await db.collection('ads').doc(adId).update({
        viewCount: admin.firestore.FieldValue.increment(1)
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

exports.getDashboardStats = async () => {
    const db = getDb();

    const adsSnapshot = await db.collection('ads').get();
    const viewsSnapshot = await db.collection('ad_views').get();
    const usersSnapshot = await db.collection('users').get();

    const totalAds = adsSnapshot.size;
    const totalViews = viewsSnapshot.size;
    const totalUsers = usersSnapshot.size;

    // Calculate total earnings (sum of all pointRewards in ad_views)
    let totalEarnings = 0;
    viewsSnapshot.forEach(doc => {
        totalEarnings += (doc.data().reward || 0);
    });

    return {
        totalAds,
        totalViews,
        totalUsers,
        totalEarnings,
        activeCampaigns: adsSnapshot.docs.filter(doc => doc.data().active).length,
        // Mocking some time-series data for the chart based on real view counts
        viewsByDay: [
            { day: 'Mon', views: Math.floor(totalViews * 0.1) },
            { day: 'Tue', views: Math.floor(totalViews * 0.15) },
            { day: 'Wed', views: Math.floor(totalViews * 0.12) },
            { day: 'Thu', views: Math.floor(totalViews * 0.18) },
            { day: 'Fri', views: Math.floor(totalViews * 0.2) },
            { day: 'Sat', views: Math.floor(totalViews * 0.15) },
            { day: 'Sun', views: Math.floor(totalViews * 0.1) }
        ]
    };
};
