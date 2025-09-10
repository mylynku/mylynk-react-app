const express = require('express');
const app = express();
require("dotenv").config();

const conf = require('./configs/mainConf.json');
const bootmodules = require('./bootmodules');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

// Initialize Passport and OAuth strategies
require('./services/ssoService');

// Security Middleware Configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Logging Configuration
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

// Security headers
app.use(helmet());

// Request logging
app.use(requestLogger);
app.use(morgan(morganFormat));

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Cookie',
        'Accept',
        'Origin',
        'X-Requested-With',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS
app.use(cors(corsOptions));

// Add headers for better cookie handling
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    next();
});

// Basic middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || conf.auth.jwt.secret));

// Rate limiting
app.use('/api/', limiter);

// Cookie configuration
const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
};

// Session configuration for OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || conf.auth.jwt.secret,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom session cookie name
    rolling: true, // Forces cookie set on every response
    cookie: cookieConfig,
    proxy: process.env.NODE_ENV === 'production' // trust the reverse proxy
}));

// Debug middleware for development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.debug('Request cookies:', req.cookies);
        console.debug('Request session:', req.session);
        console.debug('Auth header:', req.headers.authorization);
        next();
    });
}

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Security middleware for production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    app.use((req, res, next) => {
        if (req.secure) {
            // Set HSTS header
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
            next();
        } else {
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
} else {
    // Development specific middleware
    app.use((req, res, next) => {
        // Allow the app to work in dev without HTTPS
        app.set('trust proxy', false);
        next();
    });
}

// Add error handling middleware (must be after all other middleware/routes)
app.use(errorHandler);

if (require.main === module) {
    let dbInstance;
    bootmodules.init(app, conf)
        .then(({ app: server, db }) => {
            dbInstance = db;
            server.listen(conf.server.port, () => {
                console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${conf.server.port}`);
                console.log('Database connection established');
                console.log('JWT authentication initialized');
                console.log('OAuth (Google & Apple) authentication ready');
                console.log(`Security features: Rate limiting, CORS, Helmet, HTTPS${process.env.NODE_ENV === 'production' ? ' enforced' : ' disabled'}`);
            }).on('error', (err) => {
                console.error('Server error:', err);
                if (dbInstance) dbInstance.closeConnections().catch(console.error);
            });
        })
        .catch((err) => {
            console.log("Error while creating server:", err);
            if (dbInstance) dbInstance.closeConnections().catch(console.error);
        });
}