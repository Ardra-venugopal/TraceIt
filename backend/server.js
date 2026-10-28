
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./database");
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");
const claimRoutes = require("./routes/claims");
const notificationRoutes = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded images from the backend uploads folder
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// API routes
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.json({ message: "TraceIt backend is running!" });
});

// Database health check
app.get("/api/health", (req, res) => {
    try {
        const result = db.prepare("SELECT 1 AS connected").get();

        res.json({
            server: "running",
            database: result.connected === 1 ? "connected" : "error",
        });
    } catch (error) {
        res.status(500).json({
            server: "running",
            database: "error",
        });
    }
});

app.listen(PORT, () => {
    console.log(`TraceIt server running on port ${PORT}`);
});
