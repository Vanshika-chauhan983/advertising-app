const adService = require('../services/adService');

exports.createAd = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ 
                error: "Forbidden: Only admin can create ads" 
            });
        }

        const adData = req.body;

        if (!adData.title || !adData.mediaUrl || !adData.mediaType) {
            return res.status(400).json({
                error: "Missing required fields"
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
        const ads = await adService.fetchAds(req.user.uid);
        res.status(200).json(ads);

    } catch (error) {
        console.error("Fetch Ads Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.completeAd = async (req, res) => {
    try {
        const { adId } = req.body;

        if (!adId) {
            return res.status(400).json({
                error: "adId is required"
            });
        }

        const result = await adService.markAdComplete(
            req.user.uid,
            adId
        );

        res.status(200).json(result);

    } catch (error) {
        console.error("Complete Ad Error:", error);
        res.status(500).json({ error: error.message });
    }
};
