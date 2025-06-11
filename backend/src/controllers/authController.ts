import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import emailService from '../services/emailService';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

// Register new user
export const register = async (req: Request, res: Response) => {
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken((user._id as any).toString());

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
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
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
};

// Login user
export const login = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken((user._id as any).toString());

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
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          createdAt: (user as any)?.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Request password reset
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔍 Searching for user with email:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('✅ User found:', user.name);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    console.log('🔑 Reset token generated and saved');

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log('🔗 Reset URL created:', resetUrl);

    try {
      // Test email service connection
      const isEmailServiceReady = await emailService.testConnection();
      
      if (isEmailServiceReady) {
        // Send password reset email
        const emailSent = await emailService.sendPasswordResetEmail(
          user.email,
          resetUrl,
          user.name
        );

        if (emailSent) {
          console.log('✅ Password reset email sent successfully');
          res.json({ 
            message: 'Email de restablecimiento enviado correctamente',
            emailSent: true
          });
        } else {
          console.log('⚠️ Failed to send email, providing token for development');
          res.json({ 
            message: 'Error al enviar email, token disponible para desarrollo',
            emailSent: false,
            developmentToken: resetToken,
            resetUrl: resetUrl
          });
        }
      } else {
        console.log('⚠️ Email service not configured, providing token for development');
        res.json({ 
          message: 'Servicio de email no configurado - token disponible para desarrollo',
          emailSent: false,
          developmentToken: resetToken,
          resetUrl: resetUrl
        });
      }
    } catch (emailError) {
      console.error('❌ Email service error:', emailError);
      res.json({ 
        message: 'Error en servicio de email - token disponible para desarrollo',
        emailSent: false,
        developmentToken: resetToken,
        resetUrl: resetUrl
      });
    }

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: (error as Error).message });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
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
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
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
    await user.save();

    // Generate new token
    const authToken = generateToken((user._id as any).toString());

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
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 