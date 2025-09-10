const mongoose = require("mongoose")
const SessionModel = require("../database/models/SessionSchema")
const model = SessionModel.getSchema(mongoose)
const Session = mongoose.model(SessionModel.modelName, model)
const UserModel = require("../database/models/UserSchema");
const LynkerModel = require("../database/models/LynkerSchema");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError
} = require('../utils/errors');
const { logger, errorLogger } = require('../config/logger');

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().populate("LynkerId", "name")
    const formatted = sessions.map(session => ({
      _id: session._id,
      sessionDateTime: session.sessionDateTime,
      status: session.status,
      location: session.location,
      lynker: {
        name: session.LynkerId.name
      }
    }))
    logger.info('Fetched all sessions', { count: sessions.length });
    res.json(formatted)
  } catch (err) {
    errorLogger.error('Failed to fetch sessions', {
      error: err.message,
      stack: err.stack
    });
    throw new InternalServerError("Failed to fetch sessions")
  }
}

exports.createSession = async (req, res) => {
  // Use authenticated user from req.user
  const userId = req.user && req.user._id ? req.user._id : null;
  const { LynkerId, sessionDateTime, status, feedback, satisfactionRating, ipAddress, location } = req.body;

  // Validation
  if (!userId || !LynkerId || !sessionDateTime || !location || !feedback) {
    logger.warn('Missing required fields for session creation', {
      userId,
      LynkerId,
      hasDateTime: !!sessionDateTime,
      hasLocation: !!location,
      hasFeedback: !!feedback
    });
    throw new ValidationError("Missing required fields");
  }
  if (userId.toString() === LynkerId) {
    logger.warn('User and Lynker ID conflict', { userId, LynkerId });
    throw new ValidationError("User and Lynker cannot be the same");
  }
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(LynkerId)) {
    logger.warn('Invalid user or Lynker ID', { userId, LynkerId });
    throw new ValidationError("Invalid user or Lynker ID");
  }
  const sessionTime = new Date(sessionDateTime);
  if (isNaN(sessionTime.getTime()) || sessionTime < new Date()) {
    logger.warn('Invalid session time', { sessionDateTime });
    throw new ValidationError("Session time must be a valid date in the future");
  }
  // Check Lynker exists
  const Lynker = mongoose.model(LynkerModel.modelName, LynkerModel.getSchema(mongoose));
  const lynker = await Lynker.findById(LynkerId);
  if (!lynker) {
    logger.warn('Lynker not found', { LynkerId });
    throw new NotFoundError("Lynker not found");
  }
  // Prevent double-booking for the same Lynker at the same time
  const existingSession = await Session.findOne({
    LynkerId,
    sessionDateTime: sessionTime,
    status: { $in: ["pending", "confirmed"] }
  });
  if (existingSession) {
    logger.warn('Double booking attempt', {
      LynkerId,
      sessionDateTime: sessionTime
    });
    throw new ConflictError("This Lynker is already booked for the selected time");
  }
  try {
    const session = new Session({
      userId,
      LynkerId,
      sessionDateTime: sessionTime,
      status: status || "pending",
      feedback: feedback || "Scheduled via calendar",
      satisfactionRating: satisfactionRating || 5,
      ipAddress: ipAddress || req.ip,
      location
    });
    await session.save();
    logger.info('Session created successfully', {
      sessionId: session._id,
      userId,
      LynkerId,
      sessionDateTime: sessionTime
    });
    res.status(201).json({ message: "Session scheduled successfully", session });
  } catch (err) {
    errorLogger.error('Failed to schedule session', {
      error: err.message,
      stack: err.stack,
      userId,
      LynkerId,
      sessionDateTime: sessionTime
    });
    if (!err.isOperational) {
      throw new InternalServerError("Failed to schedule session");
    }
    throw err;
  }
};
