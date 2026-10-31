const mongoose = require("mongoose");
const SpaceReport = require("../models/SpaceReport");
const {
    getLatestStatus
} = require("../services/statusService");
const { REPORT_STATUSES } = require("../utils/reportConstants");
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function getModel(name) {
    return mongoose.models[name] || mongoose.model(name);
}

function sendError(res, status, message) {
    return res.status(status).json({ success: false, message });
}

function logUnexpectedError(operation, error) {
    console.error(`Report ${operation} failed:`, error);
}

function isValidationError(error) {
    return error instanceof mongoose.Error.ValidationError
        || error instanceof mongoose.Error.CastError;
}

function isValidSpaceId(value) {
    return typeof value === "string" && mongoose.isObjectIdOrHexString(value);
}

function serializeReport(report) {
    const value = typeof report.toObject === "function" ? report.toObject() : report;
    const reporter = value.reporterId && typeof value.reporterId === "object"
        ? value.reporterId
        : null;

    return {
        ...value,
        id: String(value._id),
        createdAt: value.reportedAt,
        reporterName: reporter?.name || "Community member"
    };
}

function parsePositiveInteger(value, defaultValue, maximum = Number.MAX_SAFE_INTEGER) {
    if (value === undefined) return { value: defaultValue };
    if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
        return { error: "Pagination values must be positive integers." };
    }

    const number = Number(value);
    if (!Number.isSafeInteger(number) || number > maximum) {
        return { error: `Pagination value must not exceed ${maximum}.` };
    }
    return { value: number };
}

async function createReport(req, res) {
    const { id: spaceId } = req.params;
    if (!isValidSpaceId(spaceId)) {
        return sendError(res, 400, "Invalid study space ID.");
    }

    const user = req.user;
    if (!user || !mongoose.isValidObjectId(user._id)) {
        return sendError(res, 401, "Authentication is required.");
    }
    if (!["member", "moderator"].includes(user.role)) {
        return sendError(res, 403, "Only members and moderators can submit reports.");
    }

    const { status, note } = req.body ?? {};
    if (typeof status !== "string" || !REPORT_STATUSES.includes(status)) {
        return sendError(res, 400, "Choose a valid availability status.");
    }
    if (note !== undefined && typeof note !== "string") {
        return sendError(res, 400, "Note must be text.");
    }
    if (note !== undefined) {
        const trimmedNote = note.trim();
        if (!trimmedNote) return sendError(res, 400, "Note cannot be empty.");
        if (trimmedNote.length > 300) {
            return sendError(res, 400, "Note must be 300 characters or fewer.");
        }
    }

    try {
        const StudySpace = getModel("StudySpace");
        const space = await StudySpace.findOne({
            _id: spaceId,
            active: { $ne: false }
        }).select("_id").exec();
        if (!space) return sendError(res, 404, "Study space not found or inactive.");

        const report = new SpaceReport({
            spaceId,
            reporterId: user._id,
            status,
            ...(note === undefined ? {} : { note: note.trim() })
        });
        await report.save();
        await report.populate({ path: "reporterId", select: "name" });

        return res.status(201).json({
            success: true,
            data: { report: serializeReport(report) }
        });
    } catch (error) {
        if (isValidationError(error)) {
            return sendError(res, 400, error.message);
        }
        logUnexpectedError("creation", error);
        return sendError(res, 500, "Unable to submit report.");
    }
}

async function getReportHistory(req, res) {
    const { id: spaceId } = req.params;
    if (!isValidSpaceId(spaceId)) {
        return sendError(res, 400, "Invalid study space ID.");
    }

    const pageOption = parsePositiveInteger(req.query.page, DEFAULT_PAGE);
    const limitOption = parsePositiveInteger(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
    if (pageOption.error || limitOption.error) {
        return sendError(res, 400, pageOption.error || limitOption.error);
    }
    if (!Number.isSafeInteger((pageOption.value - 1) * limitOption.value)) {
        return sendError(res, 400, "Requested page is too large.");
    }

    try {
        const StudySpace = getModel("StudySpace");
        const space = await StudySpace.findById(spaceId).select("_id").exec();
        if (!space) return sendError(res, 404, "Study space not found.");

        const page = pageOption.value;
        const limit = limitOption.value;
        const [reports, totalReports] = await Promise.all([
            SpaceReport.find({ spaceId })
                .sort({ reportedAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate({ path: "reporterId", select: "name" })
                .exec(),
            SpaceReport.countDocuments({ spaceId })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reports: reports.map(serializeReport),
                pagination: {
                    page,
                    limit,
                    totalReports,
                    totalPages: Math.ceil(totalReports / limit)
                }
            }
        });
    } catch (error) {
        logUnexpectedError("history retrieval", error);
        return sendError(res, 500, "Unable to retrieve report history.");
    }
}

async function getLatestReportStatus(req, res) {
    const { id: spaceId } = req.params;
    if (!isValidSpaceId(spaceId)) {
        return sendError(res, 400, "Invalid study space ID.");
    }

    try {
        const StudySpace = getModel("StudySpace");
        const space = await StudySpace.findById(spaceId).select("_id").exec();
        if (!space) return sendError(res, 404, "Study space not found.");

        const latest = await getLatestStatus(spaceId);
        return res.status(200).json({
            success: true,
            data: {
                report: latest.report ? serializeReport(latest.report) : null,
                status: latest.status,
                reportedAt: latest.reportedAt,
                freshness: latest.freshness
            }
        });
    } catch (error) {
        logUnexpectedError("latest status retrieval", error);
        return sendError(res, 500, "Unable to retrieve latest report.");
    }
}

module.exports = {
    createReport,
    getLatestReportStatus,
    getReportHistory,
    serializeReport
};
