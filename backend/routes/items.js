
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const db = require("../database");

const router = express.Router();

const uploadDirectory = path.join(__dirname, "../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${crypto.randomUUID()}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPG, PNG, WEBP, and GIF images are allowed.")
            );
        }

        callback(null, true);
    },
});

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in to submit a report.",
        });
    }

    try {
        req.user = jwt.verify(
            authHeader.split(" ")[1],
            process.env.JWT_SECRET
        );
        next();
    } catch {
        return res.status(401).json({
            message: "Your session is invalid. Please log in again.",
        });
    }
};

const formatItem = (item) => ({
    id: item.id,
    reporterUserId: item.reporter_user_id,
    reporterName: item.reporter_name,
    reporterEmail: item.reporter_email,
    name: item.name,
    type: item.type,
    category: item.category,
    description: item.description,
    brand: item.brand,
    color: item.color,
    location: item.location,
    date: item.date,
    time: item.time,
    imagePath: item.image_path,
    additionalDetails: item.additional_details,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
});

const getItemWithReporter = (id) =>
    db.prepare(`
    SELECT items.*, users.name AS reporter_name,
           users.email AS reporter_email
    FROM items
    JOIN users ON users.id = items.reporter_user_id
    WHERE items.id = ?
  `).get(id);

// GET all items, optionally filtered by type
router.get("/", (req, res) => {
    try {
        const { type } = req.query;

        if (type && !["lost", "found"].includes(type)) {
            return res.status(400).json({
                message: "Type must be lost or found.",
            });
        }

        const query = `
      SELECT items.*, users.name AS reporter_name,
             users.email AS reporter_email
      FROM items
      JOIN users ON users.id = items.reporter_user_id
      ${type ? "WHERE items.type = ?" : ""}
      ORDER BY items.created_at DESC
    `;

        const items = type
            ? db.prepare(query).all(type)
            : db.prepare(query).all();

        res.json(items.map(formatItem));
    } catch (error) {
        console.error("Fetch items error:", error.message);
        res.status(500).json({ message: "Could not fetch items." });
    }
});

// POST a lost/found report with an optional image
router.post("/", authenticate, (req, res, next) => {
    upload.single("image")(req, res, (uploadError) => {
        if (uploadError) {
            const status = uploadError instanceof multer.MulterError ? 400 : 400;
            return res.status(status).json({
                message: uploadError.message || "Could not upload image.",
            });
        }

        next();
    });
}, (req, res) => {
    try {
        const {
            name,
            type,
            category,
            description,
            brand,
            color,
            location,
            date,
            time,
            additionalDetails,
        } = req.body;

        if (
            !name?.trim() ||
            !type ||
            !category ||
            !description?.trim() ||
            !color ||
            !location ||
            !date
        ) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(400).json({
                message: "Please fill in all required report fields.",
            });
        }

        if (!["lost", "found"].includes(type)) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(400).json({
                message: "Report type must be lost or found.",
            });
        }

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(req.user.id);

        if (!existingUser) {
            if (req.file) fs.unlink(req.file.path, () => { });
            return res.status(401).json({
                message: "User account not found. Please log in again.",
            });
        }

        const id = crypto.randomUUID();
        const imagePath = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        db.prepare(`
      INSERT INTO items (
        id, reporter_user_id, name, type, category,
        description, brand, color, location, date, time,
        image_path, additional_details, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id,
            req.user.id,
            name.trim(),
            type,
            category,
            description.trim(),
            brand || "Generic",
            color,
            location,
            date,
            time || "12:00",
            imagePath,
            additionalDetails || null,
            type === "lost" ? "Active" : "Pending Review"
        );

        res.status(201).json({
            message: "Report submitted successfully!",
            item: formatItem(getItemWithReporter(id)),
        });
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => { });
        console.error("Create item error:", error.message);
        res.status(500).json({
            message: "Could not submit the report.",
        });
    }
});

// DELETE an item report (admin only)
router.delete("/:id", authenticate, (req, res) => {
    try {
        const dbUser = db.prepare(
            "SELECT role FROM users WHERE id = ?"
        ).get(req.user.id);

        if (!dbUser || dbUser.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const item = db.prepare(
            "SELECT id, image_path FROM items WHERE id = ?"
        ).get(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item report not found.",
            });
        }

        db.transaction(() => {
            db.prepare("DELETE FROM claims WHERE item_id = ?")
                .run(req.params.id);
            db.prepare("DELETE FROM items WHERE id = ?")
                .run(req.params.id);
        })();

        if (item.image_path?.startsWith("/uploads/")) {
            const imageFile = path.join(
                uploadDirectory,
                path.basename(item.image_path)
            );
            fs.unlink(imageFile, () => { });
        }

        res.json({ message: "Item report deleted successfully." });
    } catch (error) {
        console.error("Delete item error:", error.message);
        res.status(500).json({
            message: "Could not delete the item report.",
        });
    }
});

// PATCH an item's status (admin only)
router.patch("/:id/status", authenticate, (req, res) => {
    try {
        const dbUser = db.prepare(
            "SELECT role FROM users WHERE id = ?"
        ).get(req.user.id);

        if (!dbUser || dbUser.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const { status } = req.body;
        const allowedStatuses = [
            "Active",
            "Approved",
            "Rejected",
            "Resolved",
            "Awaiting Owner",
            "Returned",
            "Pending Review",
            "Claimed",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid report status.",
            });
        }

        const item = db.prepare(
            "SELECT id, type FROM items WHERE id = ?"
        ).get(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Report not found.",
            });
        }

        const lostStatuses = [
            "Active", "Approved", "Rejected", "Resolved", "Claimed"
        ];
        const foundStatuses = [
            "Pending Review", "Awaiting Owner", "Rejected",
            "Returned", "Claimed"
        ];

        if (
            (item.type === "lost" && !lostStatuses.includes(status)) ||
            (item.type === "found" && !foundStatuses.includes(status))
        ) {
            return res.status(400).json({
                message: "Invalid status for this report type.",
            });
        }

        db.prepare(`
      UPDATE items
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.params.id);

        res.json({
            message: "Report status updated successfully.",
            item: formatItem(getItemWithReporter(req.params.id)),
        });
    } catch (error) {
        console.error("Update item status error:", error.message);
        res.status(500).json({
            message: "Could not update the report status.",
        });
    }
});

module.exports = router;
