const { Router } = require('express');
const router = Router();

router.use('/auth', require('./authRoutes'));
router.use('/ads', require('./adRoutes'));
router.use('/wallet', require('./walletRoutes'));
router.use('/admin', require('./adminRoutes').router);
router.use('/settings', require('./settingsRoutes'));

router.get('/status', (req, res) => {
    res.json({ status: 'API is working', timestamp: new Date() });
});

module.exports = router;
