const express = require('express');
const fs = require('fs');
const pathModule = require('path');
const { promisify } = require('util');
const middlewareMaps = require('./middlewares');
const routesPath = pathModule.join(__dirname, 'routes');
const { init: initDatabase } = require('./database');
const { logger, errorLogger } = require('./config/logger');

// Promisify fs.readdir
const readdirAsync = promisify(fs.readdir);

async function initializeMiddlewares(app) {
    try {
        Object.keys(middlewareMaps).forEach((route) => {
            app.use(route, middlewareMaps[route]);
        });
        logger.info("Loaded middlewares successfully");
    } catch (error) {
        errorLogger.error("Failed to initialize middlewares:", error);
        throw error;
    }
}

async function initializeRoutes(app) {
    const reqMethods = ["get", "post", "put", "delete", "options"];
    
    const loadRoutes = (maps, path) => {
        Object.keys(maps).forEach((key) => {
            if (reqMethods.includes(key)) {
                app[key](path, async (req, res, next) => {
                    try {
                        const handlers = Array.isArray(maps[key]["handler"]) 
                            ? maps[key]["handler"] 
                            : [maps[key]["handler"]];
                        
                        // Execute handlers in sequence
                        for (const handler of handlers) {
                            await handler(req, res, next);
                            // If response is already sent, stop the chain
                            if (res.headersSent) return;
                        }
                    } catch (error) {
                        next(error);
                    }
                });
            } else {
                loadRoutes(maps[key], path + key);
            }
        });
    };

    try {
        const files = await readdirAsync(routesPath);
        files.forEach((file) => {
            const { path, routeMaps } = require(pathModule.join(routesPath, file));
            loadRoutes(routeMaps, path);
        });
        logger.info("Loaded API routes successfully");
    } catch (error) {
        errorLogger.error("Failed to initialize routes:", error);
        throw error;
    }
}

async function initializeDatabase() {
    try {
        const mainConf = require('./configs/mainConf.json');
        const db = await initDatabase({
            ...mainConf.db,
            source: 'main',
            dbName: 'lynkdb'
        });
        logger.info("Database initialized successfully");
        return db;
    } catch (error) {
        errorLogger.error("Failed to initialize database:", error);
        throw error;
    }
}

async function init(app, conf) {
    try {
        // Configure server timeouts
        app.timeout = parseInt(process.env.SERVER_TIMEOUT) || 30000;
        app.keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT) || 30000;
        app.headersTimeout = parseInt(process.env.HEADERS_TIMEOUT) || 60000;

        // Initialize components
        await initializeMiddlewares(app);
        const db = await initializeDatabase();
        await initializeRoutes(app);

        return { app, db };
    } catch (error) {
        errorLogger.error("Server initialization failed:", error);
        throw error;
    }
}

module.exports = {
    init
}