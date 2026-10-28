
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../database");

const router = express.Router();

// Verify the logged-in user
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please log in first.",
        });
    }

    try {
        const token = authHeader.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Your session is invalid. Please log in again.",
        });
    }
};

// Convert database fields to frontend-friendly fields
const formatClaim = (claim) => ({
    id: claim.id,
    itemId: claim.item_id,
    itemName: claim.item_name,
    claimantUserId: claim.claimant_user_id,
    claimantName: claim.claimant_name,
    claimantEmail: claim.claimant_email,
    privateDetail: claim.private_detail,
    additionalDescription: claim.additional_description,
    proofImagePath: claim.proof_image_path,
    status: claim.status,
    createdAt: claim.created_at,
    updatedAt: claim.updated_at,
});

// GET: Fetch claims belonging to the logged-in student
router.get("/my", authenticateUser, (req, res) => {
    try {
        const claims = db.prepare(`
            SELECT
                c.*,
                i.name AS item_name,
                u.name AS claimant_name,
                u.email AS claimant_email
            FROM claims c
            JOIN items i ON i.id = c.item_id
            JOIN users u ON u.id = c.claimant_user_id
            WHERE c.claimant_user_id = ?
            ORDER BY c.created_at DESC
        `).all(req.user.id);

        res.json(claims.map(formatClaim));
    } catch (error) {
        console.error("Fetch claims error:", error.message);
        res.status(500).json({
            message: "Could not fetch your claims.",
        });
    }
});

// POST: Submit a claim for a found item
router.post("/", authenticateUser, (req, res) => {
    try {
        const {
            itemId,
            privateDetail,
            additionalDescription,
            proofImagePath,
        } = req.body;

        if (!itemId || !privateDetail || !privateDetail.trim()) {
            return res.status(400).json({
                message: "Item and private identifying details are required.",
            });
        }

        const item = db.prepare(`
            SELECT id, name, type, status, reporter_user_id
            FROM items
            WHERE id = ?
        `).get(itemId);

        if (!item || item.type !== "found") {
            return res.status(404).json({
                message: "Found item not found.",
            });
        }

        if (item.reporter_user_id === req.user.id) {
            return res.status(403).json({
                message: "You cannot claim an item you reported yourself.",
            });
        }

        const existingClaim = db.prepare(`
            SELECT id
            FROM claims
            WHERE item_id = ? AND claimant_user_id = ?
        `).get(itemId, req.user.id);

        if (existingClaim) {
            return res.status(409).json({
                message: "You have already submitted a claim for this item.",
            });
        }

        const id = crypto.randomUUID();

        db.prepare(`
            INSERT INTO claims (
                id,
                item_id,
                claimant_user_id,
                private_detail,
                additional_description,
                proof_image_path,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `).run(
            id,
            itemId,
            req.user.id,
            privateDetail.trim(),
            additionalDescription?.trim() || null,
            proofImagePath || null
        );

        const savedClaim = db.prepare(`
            SELECT
                c.*,
                i.name AS item_name,
                u.name AS claimant_name,
                u.email AS claimant_email
            FROM claims c
            JOIN items i ON i.id = c.item_id
            JOIN users u ON u.id = c.claimant_user_id
            WHERE c.id = ?
        `).get(id);

        // Notify the person who reported the found item
        db.prepare(`
            INSERT INTO notifications (id, user_id, title, message)
            VALUES (?, ?, ?, ?)
        `).run(
            crypto.randomUUID(),
            item.reporter_user_id,
            "New claim submitted",
            `${savedClaim.claimant_name} has submitted a claim for "${item.name}".`
        );

        res.status(201).json({
            message: "Claim submitted successfully!",
            claim: formatClaim(savedClaim),
        });
    } catch (error) {
        console.error("Submit claim error:", error.message);
        res.status(500).json({
            message: "Could not submit your claim.",
        });
    }
});

// GET: Fetch all claims for the admin page
router.get("/", authenticateUser, (req, res) => {
    try {
        const user = db.prepare(
            "SELECT role FROM users WHERE id = ?"
        ).get(req.user.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const claims = db.prepare(`
            SELECT
                c.*,
                i.name AS item_name,
                i.location AS item_location,
                i.date AS item_date,
                i.description AS item_description,
                i.status AS item_status,
                u.name AS claimant_name,
                u.email AS claimant_email
            FROM claims c
            JOIN items i ON i.id = c.item_id
            JOIN users u ON u.id = c.claimant_user_id
            ORDER BY c.created_at DESC
        `).all();

        res.json(claims.map((claim) => ({
            id: claim.id,
            itemId: claim.item_id,
            itemName: claim.item_name,
            claimantUserId: claim.claimant_user_id,
            claimantName: claim.claimant_name,
            claimantEmail: claim.claimant_email,
            privateDetail: claim.private_detail,
            additionalDescription: claim.additional_description,
            proofImagePath: claim.proof_image_path,
            status: claim.status,
            dateClaimed: claim.created_at,
            createdAt: claim.created_at,
            itemLocation: claim.item_location,
            itemDate: claim.item_date,
            itemDescription: claim.item_description,
            itemStatus: claim.item_status,
        })));
    } catch (error) {
        console.error("Fetch admin claims error:", error.message);
        res.status(500).json({
            message: "Could not fetch claims.",
        });
    }
});

// PATCH: Update a claim status
router.patch("/:id/status", authenticateUser, (req, res) => {
    try {
        const user = db.prepare(
            "SELECT role FROM users WHERE id = ?"
        ).get(req.user.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Returned",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid claim status.",
            });
        }

        const claim = db.prepare(`
            SELECT
                c.id,
                c.item_id,
                c.claimant_user_id,
                c.status,
                i.name AS item_name
            FROM claims c
            JOIN items i ON i.id = c.item_id
            WHERE c.id = ?
        `).get(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found.",
            });
        }

        // Update the claim status
        db.prepare(`
            UPDATE claims
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(status, claim.id);

        if (status === "Approved") {
            db.prepare(`
                UPDATE items
                SET status = 'Claimed', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(claim.item_id);
        }

        if (status === "Returned") {
            db.prepare(`
                UPDATE items
                SET status = 'Returned', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(claim.item_id);
        }

        // Notify the claimant only when the status changes
        if (claim.status !== status) {
            db.prepare(`
                INSERT INTO notifications (id, user_id, title, message)
                VALUES (?, ?, ?, ?)
            `).run(
                crypto.randomUUID(),
                claim.claimant_user_id,
                "Claim status updated",
                `Your claim for "${claim.item_name}" is now ${status}.`
            );
        }

        res.json({
            message: "Claim status updated successfully.",
        });
    } catch (error) {
        console.error("Update claim status error:", error.message);
        res.status(500).json({
            message: "Could not update claim status.",
        });
    }
});

module.exports = router;
