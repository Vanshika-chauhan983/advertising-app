const walletService = require('../services/walletService');

exports.getBalance = async (req, res) => {
    try {
        const balance = await walletService.getBalance(req.user.uid);
        // Returning multiple formats to ensure frontend compatibility
        res.status(200).json({
            balance,
            walletBalance: balance,
            points: balance
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.redeemPoints = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDetails } = req.body;
        const result = await walletService.redeemPoints(req.user.uid, amount, paymentMethod, paymentDetails);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
