const { getDb } = require('../config/firebase');

exports.getSettings = async () => {
    const db = getDb();
    const settingsDoc = await db.collection('settings').doc('global').get();

    if (!settingsDoc.exists) {
        // Default settings
        return {
            maintenanceMode: false,
            notificationsEnabled: true,
            contactEmail: 'admin@advertising-app.com',
            twoFactorEnabled: true
        };
    }

    return settingsDoc.data();
};

exports.updateSettings = async (settingsData) => {
    const db = getDb();
    await db.collection('settings').doc('global').set(settingsData, { merge: true });
    return { success: true, settings: settingsData };
};
