const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const Toursmodel = require('./../models/tourmodel');
const ApiFeatures = require('./../utils/apiFeatures');
const ErrorClass = require('./../utils/ErrorClass');
const handlerFactory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours-simple.json', (err, data) => {
//     if (err) console.log('can not read file');
//   })
// );
// exports.checkid = (req, res, next, val) => {
//   console.log(`your tour is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'invalid id'
//     });
//   }
//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'; // Assign as a string
  req.query.sort = '-ratingAverage,price'; // Sorting order
  req.query.fields = 'name,price,ratingAverage,summary,difficulty'; // Selected fields

  next();
};

exports.getwithid = handlerFactory.getOne(Toursmodel, { path: 'Reviews' });
exports.createtour = handlerFactory.createOne(Toursmodel);
exports.getalldata = handlerFactory.getalldata(Toursmodel);
exports.updatetour = handlerFactory.updateOne(Toursmodel);
exports.deletetour = handlerFactory.deleteOne(Toursmodel);

exports.TourStats = catchAsync(async (req, res) => {
  const stats = await Toursmodel.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        totaltours: { $sum: 1 },
        totalrating: { $sum: '$ratingsQuantity' },
        ratingavg: { $avg: '$ratingsAverage' },
        maxprice: { $max: '$price' },
        minprice: { $min: '$price' }
      }
    },
    {
      $sort: { minprice: 1 }
    }
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      tour: stats
    }
  });
});

exports.BestMonth = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const stats = await Toursmodel.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numoftours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    { $addFields: { month: '$_id' } },
    {
      $project: { _id: 0 }
    },
    { $sort: { numoftours: -1 } }
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      tour: stats
    }
  });
});
// /tours-witihn/:distance/center/:langlat/unit/:unit'
exports.tourswithin = catchAsync(async (req, res, next) => {
  const { distance, langlat, unit } = req.params;
  const [lat, lang] = langlat.split(',');
  if (!lat || !lang) {
    next(new ErrorClass('please enter lat and lang'), 400);
  }
  const radians = unit === 'mile' ? distance / 3963.2 : distance / 6378.1;
  const tours = await Toursmodel.find({ startLocation: { $geoWithin: { $centerSphere: [[lang, lat], radians] } } });
  res.status(200).json({
    status: 'succes',
    Quantity: tours.length,
    data: {
      data: tours
    }
  });
});
exports.distances = catchAsync(async (req, res, next) => {
  const { langlat, unit } = req.params;
  const [lat, lang] = langlat.split(',');
  if (!lat || !lang) {
    next(new ErrorClass('please enter lat and lang'), 400);
  }
  const multiplier = unit === 'mile' ? 0.000621371 : 0.001;
  const distances = await Toursmodel.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lang * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
