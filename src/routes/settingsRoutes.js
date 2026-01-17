const { Router } = require('express')
const settingsController = require('../controllers/settingsController')
const { verifyAdmin } = require('../middleware/authMiddleware')

const router = Router()

router.get('/', verifyAdmin, settingsController.getSettings)
router.post('/', verifyAdmin, settingsController.updateSettings)

module.exports = router
