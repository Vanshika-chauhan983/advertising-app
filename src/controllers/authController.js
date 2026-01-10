const authService = require("../services/authService");

exports.login = async (req, res) => {
    try {
        const user = await authService.loginWithToken(req.user);
        res.status(200).json({
            message: "Login successful",
            user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await authService.getUserProfile(req.user.uid);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
