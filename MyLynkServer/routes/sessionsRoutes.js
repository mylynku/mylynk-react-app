const sessionController = require("../services/sessionService")
const authMiddleware = require("../middlewares/services/authMiddleware")

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  path: "/sessions",
  routeMaps: {
    "/": {
      get: { handler: [authMiddleware, wrapAsync(sessionController.getAllSessions)] },
      post: { handler: [authMiddleware, wrapAsync(sessionController.createSession)] }
    }
  }
}
