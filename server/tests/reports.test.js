const { after, before, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const serverApp = require("../app");
const createReportRoutes = require("../src/routes/reportRoutes");
const SpaceReport = require("../src/models/SpaceReport");
const {
    calculateFreshness,
    getLatestStatus
} = require("../src/services/statusService");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    role: String
});
const spaceSchema = new mongoose.Schema({
    name: String,
    active: { type: Boolean, default: true }
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
const StudySpace = mongoose.models.StudySpace || mongoose.model("StudySpace", spaceSchema);
const tokens = new Map();
const authenticate = (req, res, next) => {
    const user = tokens.get(req.get("authorization"));
    if (!user) {
        return res.status(401).json({ success: false, message: "Authentication is required." });
    }
    req.user = { _id: user._id, name: user.name, role: user.role };
    return next();
};

const app = express();
app.use(express.json());
app.use("/api/spaces", createReportRoutes({ authenticate }));

let mongoServer;
let member;
let space;
let memberToken;
let originalStaleAfterHours;

before(async () => {
    originalStaleAfterHours = process.env.STALE_AFTER_HOURS;
    process.env.STALE_AFTER_HOURS = "2";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    if (originalStaleAfterHours === undefined) delete process.env.STALE_AFTER_HOURS;
    else process.env.STALE_AFTER_HOURS = originalStaleAfterHours;
});

beforeEach(async () => {
    await Promise.all([
        SpaceReport.deleteMany({}),
        StudySpace.deleteMany({}),
        User.deleteMany({})
    ]);
    tokens.clear();
    member = await User.create({
        name: "Arun",
        email: "arun@example.edu",
        passwordHash: "must-not-be-returned",
        role: "member"
    });
    memberToken = "Bearer valid-member-token";
    tokens.set(memberToken, member);
    space = await StudySpace.create({ name: "Central Library", active: true });
});

function submitReport(spaceId = space.id, body = { status: "Available" }, token = memberToken) {
    const call = request(app).post(`/api/spaces/${spaceId}/reports`).send(body);
    return token ? call.set("Authorization", token) : call;
}

describe("report submission", () => {
    it("accepts each supported availability status and omits an absent note", async () => {
        const statuses = ["Available", "Moderately Busy", "Busy", "Temporarily Closed"];
        for (const status of statuses) {
            const response = await submitReport(space.id, { status });
            assert.equal(response.status, 201);
            assert.equal(response.body.data.report.status, status);
            assert.equal(response.body.data.report.reporterName, "Arun");
            assert.equal(response.body.data.report.reporterId.name, "Arun");
            assert.equal(response.body.data.report.createdAt, response.body.data.report.reportedAt);
        }
        assert.equal(await SpaceReport.countDocuments({ spaceId: space.id }), statuses.length);
    });

    it("creates a separate document for every submission and ignores client reporter IDs", async () => {
        const first = await submitReport(space.id, { status: "Available" });
        const second = await submitReport(space.id, {
            status: "Busy",
            reporterId: new mongoose.Types.ObjectId().toString()
        });

        assert.equal(first.status, 201);
        assert.equal(second.status, 201);
        assert.notEqual(first.body.data.report._id, second.body.data.report._id);
        assert.equal(await SpaceReport.countDocuments({ spaceId: space.id }), 2);
        const reports = await SpaceReport.find({ spaceId: space.id });
        assert.ok(reports.every((report) => report.reporterId.equals(member._id)));
    });

    it("rejects missing and invalid authentication", async () => {
        assert.equal((await submitReport(space.id, { status: "Available" }, null)).status, 401);
        assert.equal((await submitReport(space.id, { status: "Available" }, "Bearer invalid")).status, 401);
    });

    it("rejects missing, invalid, or incorrectly capitalized statuses", async () => {
        for (const body of [{}, { status: "Crowded" }, { status: "available" }]) {
            const response = await submitReport(space.id, body);
            assert.equal(response.status, 400);
            assert.equal(response.body.success, false);
        }
    });

    it("rejects malformed, nonexistent, and inactive spaces", async () => {
        assert.equal((await submitReport("not-an-object-id")).status, 400);
        assert.equal((await submitReport(new mongoose.Types.ObjectId().toString())).status, 404);
        space.active = false;
        await space.save();
        assert.equal((await submitReport(space.id)).status, 404);
    });

    it("rejects blank and overlong notes", async () => {
        assert.equal((await submitReport(space.id, { status: "Available", note: "" })).status, 400);
        assert.equal((await submitReport(space.id, { status: "Available", note: "   \t " })).status, 400);
        assert.equal((await submitReport(space.id, { status: "Available", note: "x".repeat(301) })).status, 400);
        assert.equal(await SpaceReport.countDocuments({}), 0);
    });
});

describe("report history", () => {
    it("returns only the requested space's reports newest first with safe reporter data", async () => {
        const otherSpace = await StudySpace.create({ name: "Science Study Area" });
        await SpaceReport.create([
            { spaceId: space.id, reporterId: member.id, status: "Available", reportedAt: new Date("2026-10-31T08:00:00Z") },
            { spaceId: space.id, reporterId: member.id, status: "Busy", reportedAt: new Date("2026-10-31T09:00:00Z") },
            { spaceId: otherSpace.id, reporterId: member.id, status: "Busy", reportedAt: new Date("2026-10-31T10:00:00Z") }
        ]);

        const response = await request(app).get(`/api/spaces/${space.id}/reports`);
        assert.equal(response.status, 200);
        assert.equal(response.body.data.reports.length, 2);
        assert.deepEqual(response.body.data.pagination, {
            page: 1,
            limit: 10,
            totalReports: 2,
            totalPages: 1
        });
        assert.deepEqual(response.body.data.reports.map((report) => report.status), ["Busy", "Available"]);
        assert.equal(response.body.data.reports[0].reporterId.name, "Arun");
        assert.equal(response.body.data.reports[0].reporterName, "Arun");
        assert.equal(JSON.stringify(response.body).includes("passwordHash"), false);
        assert.equal(JSON.stringify(response.body).includes("must-not-be-returned"), false);
    });

    it("supports pagination and rejects invalid page or limit values", async () => {
        await SpaceReport.create([1, 2, 3].map((hour) => ({
            spaceId: space.id,
            reporterId: member.id,
            status: "Available",
            reportedAt: new Date(`2026-10-31T0${hour}:00:00Z`)
        })));

        const response = await request(app).get(`/api/spaces/${space.id}/reports?page=2&limit=2`);
        assert.equal(response.status, 200);
        assert.equal(response.body.data.reports.length, 1);
        assert.deepEqual(response.body.data.pagination, {
            page: 2,
            limit: 2,
            totalReports: 3,
            totalPages: 2
        });
        assert.equal((await request(app).get(`/api/spaces/${space.id}/reports?page=0`)).status, 400);
        assert.equal((await request(app).get(`/api/spaces/${space.id}/reports?limit=101`)).status, 400);
    });

    it("returns 400 for invalid IDs and 404 for missing spaces", async () => {
        assert.equal((await request(app).get("/api/spaces/nope/reports")).status, 400);
        assert.equal((await request(app).get(`/api/spaces/${new mongoose.Types.ObjectId()}/reports`)).status, 404);
    });
});

describe("latest report and freshness", () => {
    it("selects the most recent report and leaves its status unchanged when stale", async () => {
        await SpaceReport.create([
            { spaceId: space.id, reporterId: member.id, status: "Busy", reportedAt: new Date("2026-10-31T06:00:00Z") },
            { spaceId: space.id, reporterId: member.id, status: "Available", reportedAt: new Date("2026-10-31T08:00:00Z") }
        ]);
        const checkedAt = new Date("2026-10-31T10:00:00Z");
        const latest = await getLatestStatus(space.id, checkedAt);

        assert.equal(latest.status, "Available");
        assert.equal(latest.freshness, "Stale");
        assert.equal(latest.report.status, "Available");
        assert.equal((await SpaceReport.findById(latest.report.id)).status, "Available");
    });

    it("returns fresh, stale, and exact-boundary results using an injectable time", () => {
        const now = new Date("2026-10-31T10:00:00Z");
        assert.equal(calculateFreshness("2026-10-31T09:00:00Z", now), "Fresh");
        assert.equal(calculateFreshness("2026-10-31T07:59:59Z", now), "Stale");
        assert.equal(calculateFreshness("2026-10-31T08:00:00Z", now), "Stale");
        assert.equal(calculateFreshness(null, now), "No Report");
    });

    it("uses configured freshness periods and defaults to two hours", () => {
        const previous = process.env.STALE_AFTER_HOURS;
        try {
            delete process.env.STALE_AFTER_HOURS;
            assert.equal(calculateFreshness("2026-10-31T08:00:00Z", new Date("2026-10-31T10:00:00Z")), "Stale");
            process.env.STALE_AFTER_HOURS = "4";
            assert.equal(calculateFreshness("2026-10-31T08:00:00Z", new Date("2026-10-31T10:00:00Z")), "Fresh");
        } finally {
            if (previous === undefined) delete process.env.STALE_AFTER_HOURS;
            else process.env.STALE_AFTER_HOURS = previous;
        }
    });

    it("exposes the latest report endpoint and reports No Report for an empty history", async () => {
        const empty = await request(app).get(`/api/spaces/${space.id}/reports/latest`);
        assert.equal(empty.status, 200);
        assert.deepEqual(
            (({ report, status, reportedAt, freshness }) => ({ report, status, reportedAt, freshness }))(empty.body.data),
            { report: null, status: null, reportedAt: null, freshness: "No Report" }
        );

        await SpaceReport.create({
            spaceId: space.id,
            reporterId: member.id,
            status: "Moderately Busy",
            reportedAt: new Date()
        });
        const latest = await request(app).get(`/api/spaces/${space.id}/reports/latest`);
        assert.equal(latest.body.data.status, "Moderately Busy");
        assert.equal(latest.body.data.freshness, "Fresh");
    });

    it("fails closed when the application has no authentication middleware configured", async () => {
        const response = await request(serverApp)
            .post(`/api/spaces/${space.id}/reports`)
            .send({ status: "Available" });
        assert.equal(response.status, 503);
        assert.equal(await SpaceReport.countDocuments({}), 0);
    });
});
