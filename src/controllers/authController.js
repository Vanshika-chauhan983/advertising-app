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

exports.listUsers = async (req, res) => {
    try {
        const users = await authService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const { uid, isBlocked } = req.body;
        const result = await authService.updateUserStatus(uid, isBlocked);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
