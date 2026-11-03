const authService = require("../services/authService");
const {
    createModeratorInvitation
} = require("../services/moderatorInvitationService");

function sendError(res, status, message) {
    return res.status(status).json({
        success: false,
        message
    });
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function register(req, res) {
    const {
        name,
        email,
        password,
        confirmPassword,
        invitationToken
    } = req.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof confirmPassword !== "string"
    ) {
        return sendError(res, 400, "All registration fields are required.");
    }

    if (
        invitationToken !== undefined &&
        typeof invitationToken !== "string"
    ) {
        return sendError(res, 400, "Invalid invitation token.");
    }

    if (name.trim().length < 2 || name.trim().length > 80) {
        return sendError(res, 400, "Name must contain between 2 and 80 characters.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return sendError(res, 400, "Enter a valid email address.");
    }

    if (password.length < 8 || password.length > 72) {
        return sendError(res, 400, "Password must contain between 8 and 72 characters.");
    }

    if (password !== confirmPassword) {
        return sendError(res, 400, "Passwords do not match.");
    }

    try {
        const data = await authService.register({
            name,
            email,
            password,
            invitationToken
        });

        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 409, "An account with this email already exists.");
        }

        if (error.status) {
            return sendError(res, error.status, error.message);
        }

        console.error("Registration failed:", error);
        return sendError(res, 500, "Unable to create account.");
    }
}

async function login(req, res) {
    const { email, password } = req.body ?? {};

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
    ) {
        return sendError(res, 400, "Email and password are required.");
    }

    try {
        const data = await authService.login({ email, password });

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        if (error.status) {
            return sendError(res, error.status, error.message);
        }

        console.error("Login failed:", error);
        return sendError(res, 500, "Unable to log in.");
    }
}

async function getCurrentUser(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            user: publicUser(req.user)
        }
    });
}

async function createModeratorInvite(req, res) {
    try {
        const { token, expiresAt } =
            await createModeratorInvitation();

        const frontendUrl = (
            process.env.CLIENT_URL || "http://localhost:5173"
        ).replace(/\/$/, "");

        const invitationLink =
            `${frontendUrl}/register?invite=${encodeURIComponent(token)}`;

        return res.status(201).json({
            success: true,
            data: {
                invitationLink,
                expiresAt
            }
        });
    } catch (error) {
        console.error("Moderator invitation failed:", error);

        return sendError(
            res,
            500,
            "Unable to create moderator invitation."
        );
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
    createModeratorInvite
};
