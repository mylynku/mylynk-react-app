const Razorpay = require("razorpay");
const crypto = require("crypto");
const mainConf = require("../configs/mainConf.json");
const razorpayConf = require("../configs/razorpayConf.json");
const services = require("./index");
const { ValidationError, InternalServerError } = require('../utils/errors');
const { logger, errorLogger } = require('../config/logger');

const razorpayInstance = new Razorpay({
  key_id: razorpayConf.key_id,
  key_secret: razorpayConf.key_secret,
});

module.exports.createOrder = async function (req, res) {
  const serviceLayer = new services(mainConf, req, res);
  try {
    const { amount, currency = "INR", receipt } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);
    logger.info('Razorpay order created', {
      orderId: order.id,
      amount: options.amount,
      currency: options.currency
    });
    return serviceLayer.handleResponse(order, 201);
  } catch (err) {
    errorLogger.error('Failed to create Razorpay order', {
      error: err.message,
      stack: err.stack,
      amount: req.body.amount,
      currency: req.body.currency
    });
    if (!err.isOperational) {
      throw new InternalServerError("Failed to create payment order");
    }
    throw err;
  }
};

module.exports.verifyPayment = async function (req, res) {
  const serviceLayer = new services(mainConf, req, res);
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac("sha256", razorpayConf.key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      logger.info('Payment verified successfully', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return serviceLayer.handleResponse({ success: true, message: "Payment verified" }, 200);
    } else {
      logger.warn('Invalid payment signature', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      throw new ValidationError("Invalid payment signature");
    }
  } catch (err) {
    errorLogger.error('Payment verification failed', {
      error: err.message,
      stack: err.stack,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
    if (!err.isOperational) {
      throw new InternalServerError("Payment verification failed");
    }
    throw err;
  }
};
