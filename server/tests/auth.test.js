
const crypto = require("crypto");
const ModeratorInvitation = require("../src/models/ModeratorInvitation");
const { after, before, beforeEach, describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryReplSet } = require("mongodb-memory-server");

const app = require("../app");
const User = require("../src/models/User");

const {
    createModeratorInvitation
} = require("../src/services/moderatorInvitationService");

let mongoServer;
let originalJwtSecret;

before(async () => {
    originalJwtSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "studyspot-test-secret-for-automated-tests";

    mongoServer = await MongoMemoryReplSet.create({
        replSet: { count: 1 }
    });

    await mongoose.connect(mongoServer.getUri());
});

after(async () => {
    await mongoose.disconnect();

    if (mongoServer) {
        await mongoServer.stop();
    }

    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

beforeEach(async () => {
    await User.deleteMany({});
    await ModeratorInvitation.deleteMany({});
});

describe("authentication API", () => {
    const account = {
        name: "Test Student",
        email: "student@example.com",
        password: "StrongPass123!",
        confirmPassword: "StrongPass123!"
    };

    it("registers a new member and returns a JWT", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(account);

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.user.name, account.name);
        assert.equal(response.body.data.user.email, account.email);
        assert.equal(response.body.data.user.role, "member");
        assert.ok(response.body.data.token);

        const savedUser = await User.findOne({
            email: account.email
        }).select("+passwordHash");

        assert.ok(savedUser);
        assert.notEqual(savedUser.passwordHash, account.password);
        assert.equal(savedUser.passwordHash.startsWith("$2"), true);
    });

    it("rejects duplicate email registration", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/register")
            .send(account);

        assert.equal(response.status, 409);
        assert.equal(await User.countDocuments(), 1);
    });

    it("rejects mismatched passwords", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                ...account,
                confirmPassword: "DifferentPass123!"
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("logs in with valid credentials", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: account.email,
                password: account.password
            });

        assert.equal(response.status, 200);
        assert.ok(response.body.data.token);
        assert.equal(response.body.data.user.email, account.email);
    });

    it("rejects incorrect login credentials", async () => {
        await request(app).post("/api/auth/register").send(account);

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: account.email,
                password: "WrongPassword123!"
            });

        assert.equal(response.status, 401);
    });

    it("returns the current user for a valid JWT", async () => {
        const registration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const token = registration.body.data.token;

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        assert.equal(response.status, 200);
        assert.equal(response.body.data.user.email, account.email);
        assert.equal(response.body.data.user.role, "member");
        assert.equal(
            JSON.stringify(response.body).includes("passwordHash"),
            false
        );
    });

    it("rejects missing and invalid JWTs", async () => {
        const missing = await request(app).get("/api/auth/me");

        const invalid = await request(app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer invalid-token");

        assert.equal(missing.status, 401);
        assert.equal(invalid.status, 401);
    });

    it("rejects moderator invitation creation without authentication", async () => {
        const response = await request(app)
            .post("/api/auth/moderator-invitations");

        assert.equal(response.status, 401);
    });

    it("prevents a member from creating moderator invitations", async () => {
        const registration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const memberToken = registration.body.data.token;

        const response = await request(app)
            .post("/api/auth/moderator-invitations")
            .set("Authorization", `Bearer ${memberToken}`);

        assert.equal(response.status, 403);
    });

    it("allows a moderator to create moderator invitations", async () => {
        // First create a valid moderator using an invitation.
        const initialInvitation = await createModeratorInvitation();

        const registration = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Moderator",
                email: "authorized-moderator@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: initialInvitation.token
            });

        assert.equal(registration.status, 201);
        assert.equal(registration.body.data.user.role, "moderator");

        const moderatorToken = registration.body.data.token;

        // Now use the moderator's JWT to create another invitation.
        const response = await request(app)
            .post("/api/auth/moderator-invitations")
            .set("Authorization", `Bearer ${moderatorToken}`);

        assert.equal(response.status, 201);
    });


    it("rejects a token when its user no longer exists", async () => {
        const registration = await request(app)
            .post("/api/auth/register")
            .send(account);

        const token = registration.body.data.token;
        await User.deleteMany({});

        const response = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${token}`);

        assert.equal(response.status, 401);
    });

    it("registers a moderator using a valid invitation", async () => {
        const invitation = await createModeratorInvitation();

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test Moderator",
                email: "moderator@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(response.status, 201);
        assert.equal(response.body.data.user.role, "moderator");
        assert.equal(
            response.body.data.user.email,
            "moderator@example.com"
        );
        assert.ok(response.body.data.token);

        const savedUser = await User.findOne({
            email: "moderator@example.com"
        });

        assert.equal(savedUser.role, "moderator");
    });

    it("rejects an invalid moderator invitation", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Invalid Moderator",
                email: "invalid@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: "invalid-invitation-token"
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("rejects an expired moderator invitation", async () => {
        const invitation = await createModeratorInvitation();

        const tokenHash = crypto
            .createHash("sha256")
            .update(invitation.token)
            .digest("hex");

        await ModeratorInvitation.updateOne(
            { tokenHash },
            {
                $set: {
                    expiresAt: new Date(Date.now() - 60 * 1000)
                }
            }
        );

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Expired Moderator",
                email: "expired@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(response.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it("rejects reuse of an already-used invitation", async () => {
        const invitation = await createModeratorInvitation();

        const accountData = {
            name: "Test Moderator",
            password: "StrongPass123!",
            confirmPassword: "StrongPass123!",
            invitationToken: invitation.token
        };

        const firstResponse = await request(app)
            .post("/api/auth/register")
            .send({
                ...accountData,
                email: "moderator1@example.com"
            });

        assert.equal(firstResponse.status, 201);

        const secondResponse = await request(app)
            .post("/api/auth/register")
            .send({
                ...accountData,
                email: "moderator2@example.com"
            });

        assert.equal(secondResponse.status, 400);
        assert.equal(await User.countDocuments(), 1);
    });

    it("does not consume an invitation when email already exists", async () => {
        await request(app)
            .post("/api/auth/register")
            .send(account);

        const invitation = await createModeratorInvitation();

        const duplicateResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Duplicate Student",
                email: account.email,
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(duplicateResponse.status, 409);

        const validResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "New Moderator",
                email: "newmoderator@example.com",
                password: "StrongPass123!",
                confirmPassword: "StrongPass123!",
                invitationToken: invitation.token
            });

        assert.equal(validResponse.status, 201);
        assert.equal(validResponse.body.data.user.role, "moderator");
    });
});
