const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./services/authMiddleware.js');


module.exports = function (app) {

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

};
