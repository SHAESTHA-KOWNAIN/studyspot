const mongoose = require("mongoose");
const { REPORT_STATUSES } = require("../utils/reportConstants");

const spaceReportSchema = new mongoose.Schema({
    spaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudySpace",
        required: true
    },
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: REPORT_STATUSES
    },
    note: {
        type: String,
        trim: true,
        maxlength: 300,
        validate: {
            validator: (value) => value === undefined || value.length > 0,
            message: "Note cannot be empty."
        }
    },
    reportedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    versionKey: false
});

spaceReportSchema.index({ spaceId: 1, reportedAt: -1 });

module.exports = mongoose.models.SpaceReport
    || mongoose.model("SpaceReport", spaceReportSchema);
