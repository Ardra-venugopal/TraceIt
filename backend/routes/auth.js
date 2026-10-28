
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

// Student registration
router.post("/signup", async (req, res) => {
    try {
        const { name, email, studentId, password } = req.body;

        if (!name || !email || !studentId || !password) {
            return res.status(400).json({
                message: "Please fill in all fields.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters.",
            });
        }

        const existingUser = db.prepare(
            "SELECT id FROM users WHERE email = ? OR student_id = ?"
        ).get(email.trim().toLowerCase(), studentId.trim());

        if (existingUser) {
            return res.status(409).json({
                message: "Email or Student ID already exists.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const id = require("crypto").randomUUID();

        db.prepare(`
            INSERT INTO users (id, name, email, student_id, password_hash)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            id,
            name.trim(),
            email.trim().toLowerCase(),
            studentId.trim(),
            passwordHash
        );

        const user = {
            id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            studentId: studentId.trim(),
            role: "student",
        };

        const token = jwt.sign(
            user,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Registration successful!",
            user,
            token,
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({
            message: "Something went wrong during registration.",
        });
    }
});

// Student and admin login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter your email/Student ID and password.",
            });
        }

        const loginValue = email.trim();

        const user = db.prepare(`
            SELECT * FROM users
            WHERE lower(email) = lower(?) OR student_id = ?
        `).get(loginValue, loginValue);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email/Student ID or password.",
            });
        }

        if (user.status === "Suspended") {
            return res.status(403).json({
                message: "Your account has been suspended.",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email/Student ID or password.",
            });
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            studentId: user.student_id,
            role: user.role,
        };

        const token = jwt.sign(
            safeUser,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful!",
            user: safeUser,
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Something went wrong during login.",
        });
    }
});

// Get all users (admin only)
router.get("/users", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = db.prepare(
            "SELECT id, role FROM users WHERE id = ?"
        ).get(decoded.id);

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const users = db.prepare(`
            SELECT
                id,
                name,
                email,
                student_id AS studentId,
                role,
                status,
                created_at AS createdAt
            FROM users
            ORDER BY created_at DESC
        `).all();

        res.json(users);
    } catch (error) {
        console.error("Get users error:", error.message);
        res.status(401).json({
            message: "Could not authenticate request.",
        });
    }
});


// Update user status (admin only)
router.patch("/users/:id/status", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = db.prepare(
            "SELECT id, role FROM users WHERE id = ?"
        ).get(decoded.id);

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required.",
            });
        }

        const { status } = req.body;

        if (!["Active", "Suspended"].includes(status)) {
            return res.status(400).json({
                message: "Invalid user status.",
            });
        }

        const targetUser = db.prepare(
            "SELECT id, role FROM users WHERE id = ?"
        ).get(req.params.id);

        if (!targetUser) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        if (targetUser.role === "admin") {
            return res.status(403).json({
                message: "Admin accounts cannot be changed here.",
            });
        }

        db.prepare(
            "UPDATE users SET status = ? WHERE id = ?"
        ).run(status, req.params.id);

        res.json({
            message: `User ${status.toLowerCase()} successfully.`,
            id: req.params.id,
            status,
        });
    } catch (error) {
        console.error("Update user status error:", error.message);
        res.status(401).json({
            message: "Could not authenticate request.",
        });
    }
});


/* Get current logged-in user's profile */
router.get("/me", (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = db.prepare(`
            SELECT
                id,
                name,
                email,
                student_id AS studentId,
                role,
                status,
                created_at AS createdAt
            FROM users
            WHERE id = ?
        `).get(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error.message);
        res.status(401).json({
            message: "Could not authenticate request.",
        });
    }
});

module.exports = router;
