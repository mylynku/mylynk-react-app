const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const UserModel = require('../../database/models/UserSchema');
const { logger, errorLogger } = require('../../config/logger');

const User = mongoose.model(UserModel.modelName, UserModel.getSchema(mongoose));

module.exports = async function authMiddleware(req, res, next) {
  try {
    // Only read token from cookies, not from headers
    const token = req.cookies?.token;

    if (!token) {
      logger.info('No authentication token provided');
      return res.status(401).json({ error: 'Authentication token is required' });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || require('../../configs/mainConf.json').auth.jwt.secret);

    if (!decoded.userId) {
      logger.warn('Invalid token format - missing userId');
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Find user by ID from token with timeout
    const user = await Promise.race([
      User.findById(decoded.userId).select('-password'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 50000)
      )
    ]);

    if (!user) {
      logger.warn('User not found for token', { userId: decoded.userId });
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn('Inactive account attempted access', { userId: user._id, status: user.status });
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Add user to request object
    logger.info('User authenticated successfully', { userId: user._id });
    req.user = user;

    // Refresh token if it's about to expire
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    if (tokenExp - now < 24 * 60 * 60 * 1000) { // Less than 24 hours left
      const newToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || require('../../configs/mainConf.json').auth.jwt.secret,
        { expiresIn: '7d' }
      );
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.message === 'Database timeout') {
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};
