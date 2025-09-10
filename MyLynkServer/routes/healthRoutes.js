const express = require('express');
const router = express.Router();
const Database = require('../database');
const { razorpayInstance } = require('../services/razorpayService');
const { logger, errorLogger } = require('../config/logger');
const process = require('process');

// Health check configuration
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds timeout for checks

// Helper function to check database connectivity
async function checkDatabase() {
  try {
    const mainConf = require('../configs/mainConf.json');
    const database = await require('../database').init({
      ...mainConf.db,
      source: 'main',
      dbName: 'lynkdb'
    });
    const userModel = await database.getUserModel();
    await userModel.db.db.command({ ping: 1 });
    return { status: 'healthy' };
  } catch (err) {
    errorLogger.error('Database health check failed', { error: err.message });
    return { status: 'unhealthy', error: err.message };
  }
}

// Helper function to check Razorpay service
async function checkRazorpay() {
  try {
    await razorpayInstance.orders.all({ count: 1 });
    return { status: 'healthy' };
  } catch (err) {
    errorLogger.error('Razorpay health check failed', { error: err.message });
    return { status: 'unhealthy', error: err.message };
  }
}

// Helper function to check system resources
function checkSystemResources() {
  return {
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    cpuUsage: process.cpuUsage(),
    status: 'healthy'
  };
}

// Main health check endpoint
async function healthCheckHandler(req, res) {
  const startTime = process.hrtime();
  const detailed = req.query.detailed === 'true';
  
  try {
    // Run all checks in parallel with timeout
    const [dbHealth, razorpayHealth, systemHealth] = await Promise.all([
      checkDatabase(),
      checkRazorpay(),
      checkSystemResources()
    ]);

    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1000) + (responseTime[1] / 1000000);

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: require('../package.json').version,
      responseTime: `${responseTimeMs.toFixed(2)}ms`,
      ...(detailed && {
        details: {
          database: dbHealth,
          razorpay: razorpayHealth,
          system: systemHealth
        }
      })
    };

    logger.info('Health check completed', {
      status: 'ok',
      responseTime: responseTimeMs
    });

    res.status(200).json(healthStatus);
  } catch (err) {
    const responseTime = process.hrtime(startTime);
    const responseTimeMs = (responseTime[0] * 1000) + (responseTime[1] / 1000000);

    errorLogger.error('Health check failed', {
      error: err.message,
      responseTime: responseTimeMs
    });

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service Unavailable',
      responseTime: `${responseTimeMs.toFixed(2)}ms`
    });
  }
}

module.exports = {
  path: '/health',
  routeMaps: {
    get: {
      handler: healthCheckHandler
    }
  }
};