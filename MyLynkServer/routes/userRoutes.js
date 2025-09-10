
const userService = require('./../services/userService');

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    path: "/users",
    routeMaps: {
        "get": {
            "handler": [wrapAsync(userService.getUsers)]
        },
        "/:userId": {
            "get": {
                "handler": [wrapAsync(userService.getUser)]
            },
            "put": {
                "handler": [wrapAsync(userService.updateUser)]
            }
        }
    }
}