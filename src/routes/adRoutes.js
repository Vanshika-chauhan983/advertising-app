const { Router } = require('express');
const adController = require('../controllers/adController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = Router();

router.get('/feed', verifyToken, adController.getAdFeed);
router.post('/complete', verifyToken, adController.completeAd);
router.post('/', verifyAdmin, adController.createAd);

module.exports = router;
