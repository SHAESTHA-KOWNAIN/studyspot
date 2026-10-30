const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "StudySpot backend is running",
        status: "OK"
    });
});

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to StudySpot API");
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

module.exports = app;