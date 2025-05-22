const TourModel = require('../models/tourmodel');
const BookingModel = require('../models/bookingmodel');
const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('../utils/ErrorClass');
const bookingModel = require('../models/bookingmodel');
exports.getTours = catchAsync(async (req, res, next) => {
  const alltours = await TourModel.find();
  res.status(200).render('overview', {
    title: ' ALL Tours',
    tours: alltours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await TourModel.findOne({ slug: req.params.slug }).populate({ path: 'Reviews', field:'review rating wroteBy'});
  if (!tour) {
    return next(new ErrorClass('there is no tour with this name', '404'))
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour: tour
  });
});
exports.login = (req, res) => {
  res.status(200).render('login', {
    title : 'Login Page'
  })
}
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await bookingModel.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour._id);
  console.log(`im loggg,${tourIDs}`)
  const tours = await TourModel.find({ _id: { $in: tourIDs } });
  console.log(`im tourss , ${tours}`)
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
