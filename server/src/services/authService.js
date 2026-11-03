
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
    consumeModeratorInvitation
} = require("./moderatorInvitationService");

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "1d";

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function register({ name, email, password, invitationToken }) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        const error = new Error(
            "An account with this email already exists."
        );
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "member"
    };

    let user;

    if (invitationToken) {
        const session = await mongoose.startSession();

        try {
            await session.withTransaction(async () => {
                const validInvitation =
                    await consumeModeratorInvitation(
                        invitationToken,
                        session
                    );

                if (!validInvitation) {
                    const error = new Error(
                        "Invalid, expired, or already-used moderator invitation."
                    );
                    error.status = 400;
                    throw error;
                }

                userData.role = "moderator";

                const createdUsers = await User.create(
                    [userData],
                    { session }
                );

                user = createdUsers[0];
            });
        } finally {
            await session.endSession();
        }
    } else {
        user = await User.create(userData);
    }

    return {
        token: createToken(user),
        user: publicUser(user)
    };
}

async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
        email: normalizedEmail
    }).select("+passwordHash");

    if (!user) {
        const error = new Error(
            "No account found with this email. Please register first."
        );
        error.status = 401;
        error.code = "EMAIL_NOT_REGISTERED";
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error(
            "Incorrect password. Please try again."
        );
        error.status = 401;
        error.code = "INVALID_PASSWORD";
        throw error;
    }

    return {
        token: createToken(user),
        user: publicUser(user)
    };
}

module.exports = { register, login };
