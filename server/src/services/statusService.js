const SpaceReport = require("../models/SpaceReport");

const DEFAULT_STALE_AFTER_HOURS = 2;

function getStaleAfterHours() {
    const configured = process.env.STALE_AFTER_HOURS;
    if (configured === undefined || configured.trim() === "") {
        return DEFAULT_STALE_AFTER_HOURS;
    }

    const hours = Number(configured);
    if (!Number.isFinite(hours) || hours < 0) {
        throw new Error("STALE_AFTER_HOURS must be a non-negative number.");
    }
    return hours;
}

function calculateFreshness(reportedAt, now = new Date(), thresholdHours = getStaleAfterHours()) {
    if (reportedAt === null || reportedAt === undefined) return "No Report";
    if (!Number.isFinite(thresholdHours) || thresholdHours < 0) {
        throw new TypeError("Freshness threshold must be a non-negative number.");
    }

    const reportTime = new Date(reportedAt).getTime();
    const currentTime = new Date(now).getTime();
    if (!Number.isFinite(reportTime) || !Number.isFinite(currentTime)) {
        throw new TypeError("Report and current timestamps must be valid dates.");
    }

    return currentTime - reportTime >= thresholdHours * 60 * 60 * 1000
        ? "Stale"
        : "Fresh";
}

async function getLatestReport(spaceId) {
    return SpaceReport.findOne({ spaceId })
        .sort({ reportedAt: -1, _id: -1 })
        .populate({ path: "reporterId", select: "name" })
        .exec();
}

async function getLatestStatus(spaceId, now = new Date()) {
    const report = await getLatestReport(spaceId);
    return {
        report,
        status: report?.status ?? null,
        reportedAt: report?.reportedAt ?? null,
        freshness: calculateFreshness(report?.reportedAt, now)
    };
}

module.exports = {
    calculateFreshness,
    getLatestReport,
    getLatestStatus
};
