const { logger } = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  // Generate request ID
  req.id = uuidv4();

  // Log request details (excluding sensitive headers)
  const { method, originalUrl, ip, headers } = req;
  logger.info(`Request started`, {
    reqId: req.id,
    method,
    path: originalUrl,
    ip,
    userAgent: headers['user-agent']
  });

  // Log response when finished
  const originalSend = res.send;
  res.send = function(body) {
    logger.info(`Request completed`, {
      reqId: req.id,
      statusCode: res.statusCode,
      contentLength: res.get('Content-Length') || 0
    });
    originalSend.call(this, body);
  };

  next();
};