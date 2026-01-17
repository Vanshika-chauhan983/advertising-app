const { admin, getDb } = require('../config/firebase')

// USER middleware
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' })
        }

        const decodedToken = await admin.auth().verifyIdToken(token)
        req.user = decodedToken
        next()
    } catch (error) {
        console.error('Error verifying token:', error)
        return res.status(403).json({ error: 'Unauthorized: Invalid token' })
    }
}

// ADMIN middleware
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const decoded = await admin.auth().verifyIdToken(token)
        const db = getDb()

        const userDoc = await db.collection('users').doc(decoded.uid).get()

        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' })
        }

        req.admin = decoded
        next()
    } catch (error) {
        return res.status(403).json({ error: 'Unauthorized' })
    }
}

module.exports = {
    verifyToken,
    verifyAdmin
}
