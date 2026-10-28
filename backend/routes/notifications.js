
const express = require("express");
const router = express.Router();
const db = require("../database");
const jwt = require("jsonwebtoken");

// Verify the logged-in user
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Authentication token required.",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token.",
        });
    }
}

// Get notifications for the logged-in user
router.get("/", authenticateToken, (req, res) => {
    try {
        const notifications = db.prepare(`
      SELECT id, title, message, read, created_at AS createdAt
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

        res.json(notifications);
    } catch (error) {
        console.error("Fetch notifications error:", error.message);
        res.status(500).json({
            message: "Failed to fetch notifications.",
        });
    }
});

// Mark one notification as read
router.patch("/:id/read", authenticateToken, (req, res) => {
    try {
        const result = db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Notification not found.",
            });
        }

        res.json({ message: "Notification marked as read." });
    } catch (error) {
        console.error("Mark notification read error:", error.message);
        res.status(500).json({
            message: "Failed to update notification.",
        });
    }
});

// Mark all notifications as read
router.patch("/read-all", authenticateToken, (req, res) => {
    try {
        db.prepare(`
      UPDATE notifications
      SET read = 1
      WHERE user_id = ?
    `).run(req.user.id);

        res.json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("Mark all notifications read error:", error.message);
        res.status(500).json({
            message: "Failed to update notifications.",
        });
    }
});

module.exports = router;
