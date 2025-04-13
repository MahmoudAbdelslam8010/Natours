const express = require('express');
const authController = require('./../controller/authController');
const tourscontrollers = require('./../controller/tourscontrollers');

const router = express.Router();
//router.param('id', tourscontrollers.checkid);
router.route('/top-5-cheapestTours').get(tourscontrollers.aliasTopTours, tourscontrollers.getalldata);
router.route('/tour-stats').get(tourscontrollers.TourStats);
router.route('/bestmonth/:year').get(tourscontrollers.BestMonth);
router
  .route('/')
  .get(authController.protect, tourscontrollers.getalldata)
  .post(tourscontrollers.createtour);
router
  .route('/:id')
  .get(tourscontrollers.getwithid)
  .patch(tourscontrollers.updatetour)
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourscontrollers.deletetour);
module.exports = router;
