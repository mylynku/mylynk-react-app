const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { logger, errorLogger } = require('../config/logger');
const nodemailer = require('nodemailer');
const mainConf = require("./../configs/mainConf.json");
const services = require("./index");
const database = require('./../database');
const validateInput = require("./validate/validateInput.js");
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError
} = require('../utils/errors');

// Email configuration
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

let db;
(async function initializeDatabase() {
    try {
        const database = await require('./../database').init({
            ...mainConf.db,
            source: 'main',
            dbName: 'lynkdb'
        });
        db = await database.getUserModel();
        logger.info('Database model initialized successfully');
    } catch (error) {
        errorLogger.error('Failed to initialize database model', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
})();

// Generate JWT Token with enhanced payload and logging
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        fullname: user.fullname,
        typeofuser: user.typeofuser,
        iat: Math.floor(Date.now() / 1000),
        tokenVersion: user.tokenVersion || 0
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || mainConf.auth.jwt.secret,
        { 
            expiresIn: JWT_EXPIRY,
            algorithm: 'HS256'
        }
    );

    logger.info('Generated JWT token', {
        userId: user._id,
        tokenInfo: {
            iat: payload.iat,
            exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days in seconds
            tokenVersion: payload.tokenVersion
        }
    });

    return token;
};

const register = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { fullname, email, password, mobile, typeofuser, ...rest } = req.body;

    try {
        const { isValid, errors } = validateInput.validateSignupInput(req.body);
        if (!isValid) {
            throw new ValidationError('Invalid input data', { errors });
        }

        // Check if user already exists
        const existingUser = await db.findOne({ email });
        if (existingUser) {
            throw new ConflictError("User already exists");
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await db.create({
            fullname,
            email,
            password: hashedPassword,
            mobile,
            typeofuser,
            status: 'active'
        });

        // Create Lynker profile if applicable
        if (typeofuser === 'lynker') {
            const lynkerDb = await new database(mainConf.db).getLynkermodel();
            await lynkerDb.create({
                userId: user._id,
                name: fullname,
                photo: rest.photo || '',
                rate: rest.rate || 0,
                category: rest.category || '',
                tags: rest.tags || [],
                bio: rest.bio || ''
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Set HTTP-only cookie with enhanced security
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        };
        
        res.cookie("token", token, cookieOptions);
        
        // Log cookie setting for debugging
        logger.info('Setting auth cookie', {
            userId: user._id,
            cookieOptions: { ...cookieOptions, token: undefined }
        });

        return serviceLayer.handleResponse({ 
            message: "Registration successful",
            user: {
                userId: user._id,
                email: user.email,
                fullname: user.fullname,
                typeofuser: user.typeofuser
            }
            // Token is only in HTTP-only cookie, not in response
        }, 201);
    } catch (err) {
        if (!err.isOperational) {
            errorLogger.error('Registration failed', {
                error: err.message,
                stack: err.stack,
                email: req.body.email
            });
            throw new InternalServerError("Registration failed");
        }
        logger.error('Registration error', {
            error: err.message,
            email: req.body.email
        });
        throw err;
    }
};

const login = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { isValid, errors } = validateInput.validateLogInInput(req.body);

    if (!isValid) {
        throw new ValidationError('Invalid login credentials', { errors });
    }

    const { email, password } = req.body;

    try {
        const user = await db.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ error: "Account is not active" });
        }

        if (!user.password) {
            return res.status(401).json({ error: "Please login with your OAuth provider" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user);

        // Set HTTP-only cookie with consistent options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined
        };
        
        res.cookie('token', token, cookieOptions);

        // Log successful login
        logger.info('User logged in successfully', {
            userId: user._id,
            email: user.email,
            timestamp: new Date().toISOString()
        });

        // Return user info WITHOUT token (token is in cookie only)
        return serviceLayer.handleResponse({
            message: "Login successful",
            user: {
                userId: user._id,
                fullname: user.fullname,
                email: user.email,
                typeofuser: user.typeofuser,
                profilePicture: user.profilePicture
            }
            // Token is only in HTTP-only cookie, not in response
        }, 200);

    } catch (err) {
        if (!err.isOperational) {
            errorLogger.error('Login failed', {
                error: err.message,
                stack: err.stack,
                email: req.body.email
            });
            throw new InternalServerError("Login failed");
        }
        logger.error('Login error', {
            error: err.message,
            email: req.body.email
        });
        throw err;
    }
};


const getCurrentUser = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    try {
        // Log incoming request details for debugging
        logger.info('getCurrentUser request', {
            cookies: req.cookies,
            headers: {
                authorization: req.headers.authorization ? 'present' : 'absent',
                cookie: req.headers.cookie ? 'present' : 'absent'
            }
        });

        if (!req.user) {
            logger.warn('User not authenticated', {
                cookies: req.cookies,
                token: req.cookies.token ? 'present' : 'absent'
            });
            return serviceLayer.handleResponse({ message: "Not authenticated" }, 401);
        }

        // Verify user exists in database with detailed logging
        const user = await db.findById(req.user.userId).select('-password').lean();
        if (!user) {
            logger.warn('User not found in database', { 
                userId: req.user.userId,
                requestUser: req.user,
                tokenPresent: !!req.cookies.token
            });
            return serviceLayer.handleResponse({ message: "User not found" }, 401);
        }

        // Log successful authentication with relevant details
        logger.info('User authenticated successfully', { 
            userId: user._id,
            email: user.email,
            status: user.status,
            lastLoginAt: user.lastLoginAt
        });

        return serviceLayer.handleResponse({
            user: {
                userId: user._id,
                email: user.email,
                fullname: user.fullname,
                typeofuser: user.typeofuser,
                status: user.status,
                lastLoginAt: user.lastLoginAt,
                emailVerified: user.emailVerified
            }
        }, 200);
    } catch (err) {
        errorLogger.error('Failed to get user details', {
            error: err.message,
            stack: err.stack,
            userId: req.user?._id
        });
        return serviceLayer.handleResponse({ error: "Failed to get user details", details: err.message }, 500);
    }
};

const logout = async function (req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    return res.status(200).json({ message: "Logged out successfully" });
};

// Email Verification
const sendVerificationEmail = async (user, verificationToken) => {
    const verificationUrl = `${process.env.APP_URL}/auth/verify-email/${verificationToken}`;
    
    await transporter.sendMail({
        to: user.email,
        subject: 'Verify your email address',
        html: `
            <h1>Email Verification</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
        `
    });
};

const verifyEmail = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { token } = req.params;

    try {
        const user = await db.findOne({
            'emailVerification.token': token,
            'emailVerification.expires': { $gt: Date.now() }
        });

        if (!user) {
            return serviceLayer.handleResponse({ message: "Invalid or expired verification token" }, 400);
        }

        user.emailVerified = true;
        user.emailVerification = undefined;
        await user.save();

        return serviceLayer.handleResponse({ message: "Email verified successfully" }, 200);
    } catch (err) {
        return serviceLayer.handleResponse({ error: "Email verification failed", details: err.message }, 500);
    }
};

// Password Reset
const requestPasswordReset = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { email } = req.body;

    try {
        const user = await db.findOne({ email });
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return serviceLayer.handleResponse({ message: "If an account exists, you will receive a password reset email" }, 200);
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        user.resetPassword = {
            token: resetToken,
            expires: resetTokenExpiry
        };
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        return serviceLayer.handleResponse({ message: "If an account exists, you will receive a password reset email" }, 200);
    } catch (err) {
        return serviceLayer.handleResponse({ error: "Password reset request failed", details: err.message }, 500);
    }
};

const resetPassword = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await db.findOne({
            'resetPassword.token': token,
            'resetPassword.expires': { $gt: Date.now() }
        });

        if (!user) {
            return serviceLayer.handleResponse({ message: "Invalid or expired reset token" }, 400);
        }

        // Update password and clear reset token
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.password = hashedPassword;
        user.resetPassword = undefined;
        await user.save();

        return serviceLayer.handleResponse({ message: "Password reset successful" }, 200);
    } catch (err) {
        return serviceLayer.handleResponse({ error: "Password reset failed", details: err.message }, 500);
    }
};

// Account Management
const changePassword = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await db.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return serviceLayer.handleResponse({ message: "Current password is incorrect" }, 401);
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.password = hashedPassword;
        await user.save();

        return serviceLayer.handleResponse({ message: "Password changed successfully" }, 200);
    } catch (err) {
        return serviceLayer.handleResponse({ error: "Password change failed", details: err.message }, 500);
    }
};

const deactivateAccount = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const userId = req.user._id;
    const { password } = req.body;

    try {
        const user = await db.findById(userId);
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return serviceLayer.handleResponse({ message: "Password is incorrect" }, 401);
        }

        user.status = 'disabled';
        await user.save();

        // Clear auth token
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return serviceLayer.handleResponse({ message: "Account deactivated successfully" }, 200);
    } catch (err) {
        return serviceLayer.handleResponse({ error: "Account deactivation failed", details: err.message }, 500);
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    logout,
    generateToken,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    deactivateAccount
};