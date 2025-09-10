const razorpayService = require('../services/razorpayService');

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  path: "/payment",
  routeMaps: {
    "/create-order": {
      post: { handler: [wrapAsync(razorpayService.createOrder)] }
    },
    "/verify": {
      post: { handler: [wrapAsync(razorpayService.verifyPayment)] }
    }
  }
};
