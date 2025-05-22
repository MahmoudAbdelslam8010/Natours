const express = require('express');

const viewsController = require('../controller/viewsController');
const authController = require('../controller/authController')
const bookingController = require('../controller/bookingController')
const router = express.Router();

router.get('/',authController.isloggedin, viewsController.getTours);
router.get('/tour/:slug',authController.isloggedin, viewsController.getTour);
router.get('/login', authController.isloggedin, viewsController.login)
router.get('/me',authController.protect,authController.getMeData)
router.get(
    '/my-tours',
    bookingController.createBookingCheckout,
    authController.protect,
    viewsController.getMyTours
);
module.exports = router;
