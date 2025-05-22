const express = require('express');
const authController = require('./../controller/authController');
const tourscontrollers = require('./../controller/tourscontrollers');
const reviewcontrollers = require('./../controller/reviewController');
const reviewRoutes = require('./reviewroutes');

const router = express.Router();
//router.param('id', tourscontrollers.checkid);
router.route('/tours-witihn/:distance/center/:langlat/unit/:unit').get(tourscontrollers.tourswithin);
router.route('/distances/:langlat/unit/:unit').get(tourscontrollers.distances);
router.use('/:tourId/reviews', reviewRoutes);
router.route('/top-5-cheapestTours').get(tourscontrollers.aliasTopTours, tourscontrollers.getalldata);
router.route('/tour-stats').get(tourscontrollers.TourStats);

router
  .route('/bestmonth/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourscontrollers.BestMonth);
router
  .route('/')
  .get(tourscontrollers.getalldata)
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourscontrollers.createtour);
router
  .route('/:id')
  .get(tourscontrollers.getwithid)
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourscontrollers.updatetourImage,tourscontrollers.rezisePhoto,tourscontrollers.updatetour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourscontrollers.deletetour);

module.exports = router;
