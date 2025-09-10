const mainConf = require("./../configs/mainConf.json");
const services = require("./index");
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
        db = await database.getLynkerModel();
        logger.info('Lynker service database initialized successfully');
    } catch (error) {
        errorLogger.error('Failed to initialize lynker service database', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
})();


module.exports.getLynker = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    try {
        const { limit = 9 } = req.query;
        let resp = await db.find({}, { createdAt: 0, updatedAt: 0 }).limit(limit);
        logger.info('Fetched lynkers', {
            count: resp.length,
            limit
        });
        return serviceLayer.handleResponse(resp, 200);
    } catch (err) {
        if (!err.isOperational) {
            errorLogger.error('Failed to get lynkers', {
                error: err.message,
                stack: err.stack
            });
            throw new InternalServerError("Failed to get lynkers");
        }
        logger.error('Failed to get lynkers', { error: err.message });
        throw err;
    }
}
module.exports.getLynkerById = async function (req, res) {
    const serviceLayer = new services(mainConf, req, res);
    const { lynkerId } = req.params;
    
    try {
        const lynker = await db.findById(lynkerId);
        if (!lynker) {
            logger.warn('Lynker not found', { lynkerId });
            throw new NotFoundError("Lynker not found");
        }
        logger.info('Fetched lynker by ID', {
            lynkerId,
            name: lynker.name
        });
        return res.json(lynker);
    } catch (err) {
        if (!err.isOperational) {
            errorLogger.error('Failed to get lynker by ID', {
                error: err.message,
                stack: err.stack,
                lynkerId
            });
            throw new InternalServerError("Failed to get lynker");
        }
        logger.error('Failed to get lynker by ID', {
            error: err.message,
            lynkerId
        });
        throw err;
    }
}