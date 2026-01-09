const adService = require('../services/adService');

exports.createAd = async (req, res) => {
    try {
        const adData = req.body;
        const newAd = await adService.createAd(adData);
        res.status(201).json(newAd);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdFeed = async (req, res) => {
    try {
        const ads = await adService.fetchAds(req.user.uid);
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.completeAd = async (req, res) => {
    try {
        const { adId } = req.body;
        const result = await adService.markAdComplete(req.user.uid, adId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

