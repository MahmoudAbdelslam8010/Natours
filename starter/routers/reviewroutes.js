const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllreview)
  .post(authController.restrictTo('user'), reviewController.setUserandTourIds, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('admin', 'user'), reviewController.UpdateReview)
  .delete(authController.restrictTo('admin', 'user'), reviewController.deleteReview);
module.exports = router;
