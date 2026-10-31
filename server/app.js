const express = require("express");
const cors = require("cors");
const createReportRoutes = require("./src/routes/reportRoutes");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/spaces", createReportRoutes());

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

app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            message: "Request body must be valid JSON."
        });
    }
    if (error.status === 413) {
        return res.status(413).json({
            success: false,
            message: "Request body is too large."
        });
    }
    console.error("Unhandled API error:", error);
    return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred."
    });
});

module.exports = app;