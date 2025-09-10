
const lynkerService = require('./../services/lynkerService');

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    path: "/lynkers",
    routeMaps: {
        "get": {
            "handler": [wrapAsync(lynkerService.getLynker)]
        },
        "/:lynkerId": {
            "get": {
                "handler": [wrapAsync(lynkerService.getLynkerById)]
            }
        }
    }
}