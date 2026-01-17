const { Router } = require('express')
const { admin, getDb } = require('../config/firebase')

const router = Router()

router.post('/login', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ error: "No token provided" })
        }

        // Verify token
        const decoded = await admin.auth().verifyIdToken(token)

        const db = getDb()
        const userDoc = await db.collection("users").doc(decoded.uid).get()

        if (!userDoc.exists) {
            return res.status(403).json({ error: "User not found" })
        }

        const userData = userDoc.data()

        // Role check
        if (userData.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin only." })
        }

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            admin: {
                uid: decoded.uid,
                email: decoded.email
            }
        })

    } catch (error) {
        console.error("Admin login error:", error)
        res.status(403).json({ error: "Invalid or expired token" })
    }
})

/**
 * Middleware: Protect admin routes
 */
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({ error: "No token provided" })
        }

        const decoded = await admin.auth().verifyIdToken(token)

        const db = getDb()
        const userDoc = await db.collection("users").doc(decoded.uid).get()

        if (!userDoc.exists || userDoc.data().role !== "admin") {
            return res.status(403).json({ error: "Admin access required" })
        }

        req.admin = decoded
        next()

    } catch (e) {
        return res.status(403).json({ error: "Unauthorized" })
    }
}

module.exports = {
    router,
    verifyAdmin
}
