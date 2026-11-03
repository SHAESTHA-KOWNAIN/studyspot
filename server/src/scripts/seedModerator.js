
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedModerator() {
    try {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Moderator seed is disabled in production.");
        }

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from server/.env");
        }

        const email = "moderator.test@studyspot.demo";
        const password = process.env.MODERATOR_TEST_PASSWORD;

        if (!password || password.length < 8 || password.length > 72) {
            throw new Error(
                "Set MODERATOR_TEST_PASSWORD in server/.env (8–72 characters)."
            );
        }

        await mongoose.connect(process.env.MONGO_URI);

        const passwordHash = await bcrypt.hash(password, 12);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            existingUser.name = "Moderator Test";
            existingUser.passwordHash = passwordHash;
            existingUser.role = "moderator";
            await existingUser.save();
        } else {
            await User.create({
                name: "Moderator Test",
                email,
                passwordHash,
                role: "moderator"
            });
        }

        console.log("Moderator test account ready.");
        console.log(`Email: ${email}`);
        console.log("Password: Use MODERATOR_TEST_PASSWORD from server/.env");
    } catch (error) {
        console.error("Moderator seed failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedModerator();
