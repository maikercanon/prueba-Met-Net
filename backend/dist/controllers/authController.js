"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getProfile = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const emailService_1 = __importDefault(require("../services/emailService"));
const auth_1 = require("../middleware/auth");
// Register new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }
        // Check if user already exists
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        // Create new user
        const user = new User_1.User({ name, email, password });
        yield user.save();
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        // Find user by email
        const user = yield User_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check password
        const isValidPassword = yield user.isValidPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});
exports.login = login;
// Get current user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                user: {
                    id: user === null || user === void 0 ? void 0 : user._id,
                    name: user === null || user === void 0 ? void 0 : user.name,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    createdAt: user === null || user === void 0 ? void 0 : user.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});
exports.getProfile = getProfile;
// Request password reset
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        console.log('🔍 Searching for user with email:', email);
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        console.log('✅ User found:', user.name);
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        yield user.save();
        console.log('🔑 Reset token generated and saved');
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        console.log('🔗 Reset URL created:', resetUrl);
        try {
            // Test email service connection
            const isEmailServiceReady = yield emailService_1.default.testConnection();
            if (isEmailServiceReady) {
                // Send password reset email
                const emailSent = yield emailService_1.default.sendPasswordResetEmail(user.email, resetUrl, user.name);
                if (emailSent) {
                    console.log('✅ Password reset email sent successfully');
                    res.json({
                        message: 'Email de restablecimiento enviado correctamente',
                        emailSent: true
                    });
                }
                else {
                    console.log('⚠️ Failed to send email, providing token for development');
                    res.json({
                        message: 'Error al enviar email, token disponible para desarrollo',
                        emailSent: false,
                        developmentToken: resetToken,
                        resetUrl: resetUrl
                    });
                }
            }
            else {
                console.log('⚠️ Email service not configured, providing token for development');
                res.json({
                    message: 'Servicio de email no configurado - token disponible para desarrollo',
                    emailSent: false,
                    developmentToken: resetToken,
                    resetUrl: resetUrl
                });
            }
        }
        catch (emailError) {
            console.error('❌ Email service error:', emailError);
            res.json({
                message: 'Error en servicio de email - token disponible para desarrollo',
                emailSent: false,
                developmentToken: resetToken,
                resetUrl: resetUrl
            });
        }
    }
    catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide new password'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }
        // Hash the token
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find user with valid reset token
        const user = yield User_1.User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        // Generate new token
        const authToken = (0, auth_1.generateToken)(user._id.toString());
        res.json({
            success: true,
            message: 'Password reset successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token: authToken
            }
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.resetPassword = resetPassword;
