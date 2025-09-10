const { AppError } = require('../utils/errors');
const morgan = require('morgan');
const { logger, errorLogger } = require('../config/logger');

module.exports = (err, req, res, next) => {
  // Set default values if not an AppError
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details in development
  const logContext = {
    reqId: req.id,
    stack: err.stack,
    error: err
  };

  if (process.env.NODE_ENV === 'development') {
    errorLogger.error(err.message, logContext);
    logger.error(err.message, logContext);
  } else if (process.env.NODE_ENV === 'production') {
    errorLogger.error(err.message, { reqId: req.id });
  }

  // Handle operational errors (trusted errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Handle programming/unknown errors
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};