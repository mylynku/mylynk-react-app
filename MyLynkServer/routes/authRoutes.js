const authService = require('../services/authenticationService');
const authMiddleware = require('../middlewares/services/authMiddleware');
const ssoService = require('../services/ssoService');

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    path: "/auth",
    routeMaps: {
        // Authentication Routes
        "/register": {
            post: { handler: [wrapAsync(authService.register)] }
        },
        "/login": {
            post: { handler: [wrapAsync(authService.login)] }
        },
        "/me": {
            get: { handler: [authMiddleware, wrapAsync(authService.getCurrentUser)] }
        },
        "/logout": {
            post: { handler: [wrapAsync(authService.logout)] }
        },

        // Email Verification
        "/verify-email/:token": {
            get: { handler: [wrapAsync(authService.verifyEmail)] }
        },

        // Password Management
        "/request-password-reset": {
            post: { handler: [wrapAsync(authService.requestPasswordReset)] }
        },
        "/reset-password/:token": {
            post: { handler: [wrapAsync(authService.resetPassword)] }
        },
        "/change-password": {
            post: { handler: [authMiddleware, wrapAsync(authService.changePassword)] }
        },

        // Account Management
        "/deactivate": {
            post: { handler: [authMiddleware, wrapAsync(authService.deactivateAccount)] }
        },

        // OAuth Routes
        "/google": {
            get: { handler: [wrapAsync(ssoService.googleAuth)] }
        },
        "/google/callback": {
            get: { handler: [wrapAsync(ssoService.googleCallback)] }
        },
        "/apple": {
            get: { handler: [wrapAsync(ssoService.appleAuth)] }
        },
        "/apple/callback": {
            get: { handler: [wrapAsync(ssoService.appleCallback)] }
        }
    }
};