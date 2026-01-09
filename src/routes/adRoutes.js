const { Router } = require('express');
const adController = require('../controllers/adController');
const verifyToken = require('../middleware/authMiddleware');

const router = Router();

router.get('/feed', verifyToken, adController.getAdFeed);
router.post('/complete', verifyToken, adController.completeAd);
router.post('/', verifyToken, adController.createAd); // TODO: Add admin check

module.exports = router;
