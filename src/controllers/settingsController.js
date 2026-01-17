const settingsService = require('../services/settingsService');

exports.getSettings = async (req, res) => {
    try {
        const settings = await settingsService.getSettings();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const result = await settingsService.updateSettings(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
