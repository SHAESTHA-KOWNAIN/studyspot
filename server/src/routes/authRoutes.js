const express = require("express");
const {
    register,
    login,
    getCurrentUser,
    createModeratorInvite
} = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);

// Only moderators can generate invitations for now.
router.post(
    "/moderator-invitations",
    authenticate,
    authorizeRoles("moderator"),
    createModeratorInvite
);

module.exports = router;
