const mainConf = require("./../configs/mainConf.json")
const database = require('./../database');
const { NotFoundError, InternalServerError } = require('../utils/errors');
const { logger, errorLogger } = require('../config/logger');
var db;
(async function initializeDatabase() {
  try {
    const database = await require('./../database').init({
      ...mainConf.db,
      source: 'main',
      dbName: 'lynkdb'
    });
    db = await database.getUserModel();
    logger.info('User service database initialized successfully');
  } catch (error) {
    errorLogger.error('Failed to initialize user service database', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
})();


module.exports.getUsers = async function (req, res) {
  try {
    const users = await db.find({});
    logger.info('Fetched all users', { count: users.length });
    return res.json(users);
  } catch (err) {
    if (!err.isOperational) {
      errorLogger.error('Failed to fetch users', {
        error: err.message,
        stack: err.stack
      });
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    logger.error('Failed to fetch users', { error: err.message });
    return res.status(400).json({ error: err.message });
  }
}

module.exports.getUser = async function (req, res) {
  try {
    const { userId } = req.params;
    const user = await db.findOne({ _id: userId });
    if (!user) {
      logger.warn('User not found', { userId });
      return res.status(404).json({ error: "User not found" });
    }
    logger.info('Fetched user', { userId });
    return res.json(user);
  } catch (err) {
    if (!err.isOperational) {
      errorLogger.error('Failed to fetch user', {
        error: err.message,
        stack: err.stack,
        userId: req.params.userId
      });
      return res.status(500).json({ error: "Failed to fetch user" });
    }
    logger.error('Failed to fetch user', { error: err.message, userId: req.params.userId });
    return res.status(400).json({ error: err.message });
  }
}

module.exports.updateUser = async function (req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.typeofuser;
    delete updateData.status;
    
    const user = await db.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      logger.warn('User not found for update', { userId });
      return res.status(404).json({ error: "User not found" });
    }
    
    logger.info('Updated user', { userId });
    return res.json(user);
  } catch (err) {
    if (!err.isOperational) {
      errorLogger.error('Failed to update user', {
        error: err.message,
        stack: err.stack,
        userId: req.params.userId
      });
      return res.status(500).json({ error: "Failed to update user" });
    }
    logger.error('Failed to update user', { error: err.message, userId: req.params.userId });
    return res.status(400).json({ error: err.message });
  }
}