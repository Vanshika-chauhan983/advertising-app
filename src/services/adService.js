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

    if (!adId || typeof adId !== 'string') {
        throw new Error('Invalid adId');
    }

    // Loophole Fix: Check if user has already viewed this ad
    const existingView = await db.collection('ad_views')
        .where('userId', '==', userId)
        .where('adId', '==', adId)
        .limit(1)
        .get();

    if (!existingView.empty) {
        throw new Error('Reward already claimed for this advertisement');
    }

    const adDoc = await db.collection('ads').doc(adId).get();

    if (!adDoc.exists) {
        throw new Error('Ad not found');
    }

    const adData = adDoc.data();
    const reward = adData.pointReward || 0;

    // Use a transaction to ensure atomic view logging and wallet update
    return await db.runTransaction(async (t) => {
        // Double check view in transaction for absolute safety
        const viewCheck = await t.get(db.collection('ad_views')
            .where('userId', '==', userId)
            .where('adId', '==', adId)
            .limit(1));

        if (!viewCheck.empty) {
            throw new Error('Reward already claimed');
        }

        // Save view
        const viewRef = db.collection('ad_views').doc();
        t.set(viewRef, {
            userId,
            adId,
            timestamp: new Date().toISOString(),
            reward
        });

        // Increment Ad viewCount
        t.update(db.collection('ads').doc(adId), {
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
    });
};

exports.getDashboardStats = async () => {
    const db = getDb();

    const adsSnapshot = await db.collection('ads').get();
    const viewsSnapshot = await db.collection('ad_views').get();
    const usersSnapshot = await db.collection('users').get();

    const totalAds = adsSnapshot.size;
    const totalViews = viewsSnapshot.size;
    const totalUsers = usersSnapshot.size;

    // Calculate total earnings and real time-series data
    let totalEarnings = 0;
    const viewsByDay = [
        { day: 'Mon', views: 0 },
        { day: 'Tue', views: 0 },
        { day: 'Wed', views: 0 },
        { day: 'Thu', views: 0 },
        { day: 'Fri', views: 0 },
        { day: 'Sat', views: 0 },
        { day: 'Sun', views: 0 }
    ];

    viewsSnapshot.forEach(doc => {
        const data = doc.data();
        totalEarnings += (data.reward || 0);

        if (data.timestamp) {
            const date = new Date(data.timestamp);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayObj = viewsByDay.find(d => d.day === dayName);
            if (dayObj) dayObj.views++;
        }
    });

    return {
        totalAds,
        totalViews,
        totalUsers,
        totalEarnings,
        activeCampaigns: adsSnapshot.docs.filter(doc => doc.data().active).length,
        viewsByDay
    };
};
