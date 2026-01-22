const adService = require('../services/adService');

exports.createAd = async (req, res) => {
    try {
        // Compatibility check: check req.admin (from verifyAdmin) or req.user (from verifyToken)
        const user = req.admin || req.user;

        if (!user || user.role !== "admin") {
            // Check if role is in user document if not in token
            const db = require('../config/firebase').getDb();
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (!userDoc.exists || userDoc.data().role !== "admin") {
                return res.status(403).json({
                    error: "Forbidden: Only admin can create ads"
                });
            }
        }

        const adData = req.body;

        if (!adData.title || !adData.mediaUrl || !adData.mediaType) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        // Validate numeric fields to prevent negative values
        if (adData.timerDuration !== undefined && (isNaN(adData.timerDuration) || adData.timerDuration <= 0)) {
            return res.status(400).json({
                error: "Timer duration must be a positive number"
            });
        }

        if (adData.pointReward !== undefined && (isNaN(adData.pointReward) || adData.pointReward <= 0)) {
            return res.status(400).json({
                error: "Point reward must be a positive number"
            });
        }

        if (adData.budget !== undefined && (isNaN(adData.budget) || adData.budget <= 0)) {
            return res.status(400).json({
                error: "Budget must be a positive number"
            });
        }

        if (adData.dailyCap !== undefined && (isNaN(adData.dailyCap) || adData.dailyCap <= 0)) {
            return res.status(400).json({
                error: "Daily cap must be a positive number"
            });
        }

        const newAd = await adService.createAd(adData);
        res.status(201).json(newAd);

    } catch (error) {
        console.error("Create Ad Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAdFeed = async (req, res) => {
    try {
        const userId = req.user ? req.user.uid : null;
        // Check if the request comes from an admin (req.admin is set by verifyAdmin middleware)
        // OR if the user has admin role in their token/profile
        const isAdmin = !!req.admin;

        const ads = await adService.fetchAds(isAdmin);
        res.status(200).json(ads);

    } catch (error) {
        console.error("Fetch Ads Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.toggleAdStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== 'boolean') {
            return res.status(400).json({ error: "Active status must be a boolean" });
        }

        const result = await adService.updateAdStatus(id, active);
        res.status(200).json(result);
    } catch (error) {
        console.error("Toggle Status Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.completeAd = async (req, res) => {
    try {
        const { adId } = req.body;
        const userId = req.user ? req.user.uid : null;

        if (!adId || !userId) {
            return res.status(400).json({
                error: "adId and authentication are required"
            });
        }

        const result = await adService.markAdComplete(
            userId,
            adId
        );

        res.status(200).json(result);

    } catch (error) {
        console.error("Complete Ad Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await adService.getDashboardStats();
        res.status(200).json(stats);
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};
