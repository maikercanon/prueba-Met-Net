"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/forgot-password', authController_1.forgotPassword);
router.post('/reset-password/:token', authController_1.resetPassword);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
