const mongoose = require("mongoose");
const schemaMapper = require("./models");
const { logger, errorLogger } = require('../config/logger');

const connections = new Map();
const dbMapper = {
  "main": "lynkdb",
  "test": "lynkdbtest"
};

let isConnecting = false;
let connectionPromise = null;

function getConnectionOptions(conf) {
  return {
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 15000,
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 60000,
    family: 4, // Use IPv4
    maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 20,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 20000,
    retryWrites: true,
    retryReads: true,
    autoIndex: process.env.NODE_ENV !== 'production',
    heartbeatFrequencyMS: 2000
  };
}

async function getDbConnection(dbName, conf) {
  try {
    // Check if we're already connecting
    if (isConnecting) {
      logger.info('Connection already in progress, waiting...');
      return await connectionPromise;
    }

    // Check existing connection
    if (connections.has(dbName)) {
      const cachedConn = connections.get(dbName);
      if (cachedConn.readyState === 1) {
        return cachedConn;
      }
      logger.warn(`Stale connection found for ${dbName}, recreating...`);
      connections.delete(dbName);
    }

    isConnecting = true;
    connectionPromise = (async () => {
      // Prefer config.db.uri, fallback to process.env.MONGODB_URI
      const uri = (conf && conf.uri) || process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MongoDB URI not configured');
      }

      // For Atlas, dbName is usually set in the URI, but keep for model lookup
      if (conf && conf.isAtlas && !conf.dbName) {
        conf.dbName = 'lynkdb';
      }

      const options = getConnectionOptions(conf);

      // Create new connection with retry logic
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const newConn = await mongoose.createConnection(uri, options);

          // Handle connection events
          newConn.on('error', (err) => {
            errorLogger.error('MongoDB connection error:', err);
            connections.delete(dbName);
          });

          newConn.on('disconnected', () => {
            logger.warn('MongoDB disconnected, will try to reconnect...');
            connections.delete(dbName);
          });

          newConn.on('connected', () => {
            logger.info('MongoDB connected successfully');
          });

          newConn.on('reconnected', () => {
            logger.info('MongoDB reconnected successfully');
          });

          // Initialize models on this connection
          Object.entries(schemaMapper).forEach(([modelName, schema]) => {
            newConn.model(modelName, schema);
          });

          connections.set(dbName, newConn);
          return newConn;
        } catch (error) {
          attempts++;
          errorLogger.error(`MongoDB connection attempt ${attempts} failed:`, error);

          if (attempts === maxAttempts) {
            throw error;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
    })();

    return await connectionPromise;
  } catch (error) {
    errorLogger.error('Failed to establish MongoDB connection:', error);
    throw error;
  } finally {
    isConnecting = false;
    connectionPromise = null;
  }
}

async function getDbModel(dbName, modelName) {
  try {
    const db = await getDbConnection(dbName, this.conf);
    if (!db) {
      throw new Error(`Failed to get connection for database: ${dbName}`);
    }
    return db.models[modelName] || db.model(modelName, schemaMapper.get(modelName));
  } catch (error) {
    errorLogger.error(`Failed to get model ${modelName}:`, error);
    throw error;
  }
}

class Database {
  constructor(conf) {
    this.conf = conf;
    this.isInitialized = false;
  }

  async init() {
    try {
      if (this.isInitialized) {
        return this;
      }

      // Test the connection by getting the User model
      await this.getUserModel();
      this.isInitialized = true;
      logger.info('Database initialized successfully');
      return this;
    } catch (error) {
      errorLogger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async getUserModel() {
    return getDbModel.call(this, this.conf.dbName, 'User');
  }

  async getLynkerModel() {
    return getDbModel.call(this, this.conf.dbName, 'Lynker');
  }

  async getSessionModel() {
    return getDbModel.call(this, this.conf.dbName, 'Session');
  }

  async closeConnections() {
    try {
      const conn = connections.get(this.conf.dbName);
      if (conn) {
        await conn.close();
        connections.delete(this.conf.dbName);
        logger.info('Database connections closed successfully');
      }
    } catch (error) {
      errorLogger.error('Error closing database connections:', error);
      throw error;
    }
  }
}

// Export both the Database class and useful functions
module.exports = {
  Database,
  getDbConnection,
  getDbModel,
  init: async (config) => {
    const db = new Database(config);
    return db.init();
  }
};
