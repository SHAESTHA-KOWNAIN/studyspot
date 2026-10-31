const express = require("express");
const {
    createReport,
    getLatestReportStatus,
    getReportHistory
} = require("../controllers/reportController");

function authenticationNotConfigured(req, res) {
    return res.status(503).json({
        success: false,
        message: "Report submission is unavailable until authentication middleware is configured."
    });
}

function createReportRoutes({ authenticate } = {}) {
    const router = express.Router();
    const reportAuthentication = authenticate || authenticationNotConfigured;

    router.post("/:id/reports", reportAuthentication, createReport);
    router.get("/:id/reports/latest", getLatestReportStatus);
    router.get("/:id/reports", getReportHistory);

    return router;
}

module.exports = createReportRoutes;
