
const mongoose = require("mongoose");

const moderatorInvitationSchema = new mongoose.Schema(
    {
        tokenHash: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        usedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Automatically remove expired invitations.
moderatorInvitationSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
    "ModeratorInvitation",
    moderatorInvitationSchema
);
