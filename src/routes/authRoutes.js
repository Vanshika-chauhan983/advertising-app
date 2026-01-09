const { Router } = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const router = Router();

router.post('/login', verifyToken, authController.login);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
