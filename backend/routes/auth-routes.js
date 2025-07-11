const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth-controller");

// OAuth routes
router.get("/", authController.startAirtableOAuth);
router.get("/callback", authController.handleAirtableOAuthCallback);
router.get("/auth-status", authController.authStatus);
router.delete("/logout", authController.logout);

module.exports = router;
