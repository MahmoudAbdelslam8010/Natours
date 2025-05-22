const express = require('express');
const authController = require('./../controller/authController');
const bookingController = require('../controller/bookingController')
const router = express.Router();
router.get('/checkout/:tourId',authController.protect,bookingController.getCheckOut)
module.exports = router;
