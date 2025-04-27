const TourModel = require('../models/tourmodel');
const catchAsync = require('../utils/catchAsync');

exports.getTours = catchAsync(async (req, res, next) => {
  const alltours = await TourModel.find();
  res.status(200).render('overview', {
    title: ' ALL Tours',
    tours: alltours
  });
});
