const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const jwt = require('jsonwebtoken');
const mainConf = require('../configs/mainConf.json');
const { init: initDatabase } = require('../database');

let db;
(async function () {
    try {
        const database = await initDatabase({
            ...mainConf.db,
            source: 'main',
            dbName: 'lynkdb'
        });
        db = await database.getUserModel();
        console.log('SSO Service: Database model initialized successfully');
    } catch (error) {
        console.error('SSO Service: Failed to initialize database model', error);
        throw error;
    }
})();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            fullname: user.fullname,
            typeofuser: user.typeofuser
        },
        process.env.JWT_SECRET || mainConf.auth.jwt.secret,
        { expiresIn: mainConf.auth.jwt.expiresIn }
    );
};

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: mainConf.auth.oauth.google.clientId,
    clientSecret: mainConf.auth.oauth.google.clientSecret,
    callbackURL: mainConf.auth.oauth.google.callbackUrl
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Check if user exists in our database
        let user = await db.findOne({ email });
        if (!user) {
            // Create new user
            user = await db.create({
                fullname: displayName,
                email: email,
                emailVerified: true,
                status: 'active',
                typeofuser: 'normal_user', // Default to normal user
                oauth: {
                    google: id
                }
            });
            return done(null, user);
        } else {
            // If user exists but is not linked to Google, link it
            if (!user.oauth?.google) {
                // If user was created with password (normal signup), block SSO signup
                if (user.password) {
                    return done(null, false, { message: 'Email already exists, please login.' });
                }
                user.oauth = {
                    ...user.oauth,
                    google: id
                };
                await user.save();
            }
            return done(null, user);
        }
    } catch (error) {
        return done(error);
    }
}));

// Apple OAuth Strategy
passport.use(new AppleStrategy({
    clientID: mainConf.auth.oauth.apple.clientId,
    teamID: mainConf.auth.oauth.apple.teamId,
    keyID: mainConf.auth.oauth.apple.keyId,
    privateKeyLocation: mainConf.auth.oauth.apple.privateKey,
    callbackURL: mainConf.auth.oauth.apple.callbackUrl,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
        const { email, name } = profile;
        const displayName = name ? `${name.firstName} ${name.lastName}` : 'Apple User';

        // Check if user exists in our database
        let user = await db.findOne({ email });
        if (!user) {
            // Create new user
            user = await db.create({
                fullname: displayName,
                email: email,
                emailVerified: true,
                status: 'active',
                typeofuser: 'normal_user', // Default to normal user
                oauth: {
                    apple: profile.id
                }
            });
            return done(null, user);
        } else {
            // If user exists but is not linked to Apple, link it
            if (!user.oauth?.apple) {
                // If user was created with password (normal signup), block SSO signup
                if (user.password) {
                    return done(null, false, { message: 'Email already exists, please login.' });
                }
                user.oauth = {
                    ...user.oauth,
                    apple: profile.id
                };
                await user.save();
            }
            return done(null, user);
        }
    } catch (error) {
        return done(error);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Google OAuth handlers
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleCallback = async (req, res) => {
    passport.authenticate('google', async (err, user, info) => {
        if (err) {
            return res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=Google authentication failed`);
        }
        if (!user) {
            const errorMsg = info && info.message ? encodeURIComponent(info.message) : 'User not found';
            return res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=${errorMsg}`);
        }

        try {
            // Generate JWT token
            const token = generateToken(user);

            // Set cookie simply: httpOnly, sameSite=Lax, secure only in production
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=true&provider=google`);
        } catch (error) {
            res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=Authentication failed`);
        }
    })(req, res);
};

// Apple OAuth handlers
const appleAuth = passport.authenticate('apple', { scope: ['email', 'name'] });

const appleCallback = async (req, res) => {
    passport.authenticate('apple', async (err, user, info) => {
        if (err) {
            return res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=Apple authentication failed`);
        }
        if (!user) {
            const errorMsg = info && info.message ? encodeURIComponent(info.message) : 'User not found';
            return res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=${errorMsg}`);
        }

        try {
            // Generate JWT token
            const token = generateToken(user);

            // Set cookie simply: httpOnly, sameSite=Lax, secure only in production
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=true&provider=apple`);
        } catch (error) {
            res.redirect(`${mainConf.server.frontendUrl || 'http://localhost:5173'}?auth_success=false&error=Authentication failed`);
        }
    })(req, res);
};

module.exports = {
    googleAuth,
    googleCallback,
    appleAuth,
    appleCallback
}; 