const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('./../utils/ErrorClass');
const UserModel = require('../models/usermodel');
const ApiFeatures = require('./../utils/apiFeatures');
const reviewModel = require('../models/reviewmodel');
const handlerFactory = require('./handlerFactory');

exports.setUserandTourIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.wroteBy) req.body.wroteBy = req.user.id;
  next();
};
exports.getReview = handlerFactory.getOne(reviewModel);
exports.createReview = handlerFactory.createOne(reviewModel);
exports.UpdateReview = handlerFactory.updateOne(reviewModel);
exports.getAllreview = handlerFactory.getalldata(reviewModel);
exports.deleteReview = handlerFactory.deleteOne(reviewModel);
