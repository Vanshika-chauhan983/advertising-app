const { Router } = require('express');
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = Router();

router.post('/login', verifyToken, authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.get('/users', verifyAdmin, authController.listUsers);
router.post('/users/toggle-status', verifyAdmin, authController.toggleUserStatus);

module.exports = router;
