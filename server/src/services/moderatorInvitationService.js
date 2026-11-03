const crypto = require("crypto");
const ModeratorInvitation = require("../models/ModeratorInvitation");

const INVITATION_EXPIRY_HOURS = 24;

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const createModeratorInvitation = async () => {
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
        Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000
    );

    await ModeratorInvitation.create({
        tokenHash: hashToken(token),
        expiresAt
    });

    return { token, expiresAt };
};

const consumeModeratorInvitation = async (token, session) => {
    if (
        typeof token !== "string" ||
        !/^[a-f0-9]{64}$/i.test(token) ||
        !session
    ) {
        return false;
    }

    const invitation = await ModeratorInvitation.findOneAndUpdate(
        {
            tokenHash: hashToken(token),
            usedAt: null,
            expiresAt: { $gt: new Date() }
        },
        {
            $set: { usedAt: new Date() }
        },
        {
            returnDocument: "after",
            session
        }
    );

    return Boolean(invitation);
};

module.exports = {
    createModeratorInvitation,
    consumeModeratorInvitation
};
