const { Router } = require('express')
const walletController = require('../controllers/walletController')
const { verifyToken } = require('../middleware/authMiddleware')

const router = Router()

router.get('/balance', verifyToken, walletController.getBalance)
router.post('/redeem', verifyToken, walletController.redeemPoints)

module.exports = router
