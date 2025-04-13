const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const Toursmodel = require('./../models/tourmodel');
const ApiFeatures = require('./../utils/apiFeatures');
const ErrorClass = require('./../utils/ErrorClass');
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

exports.getalldata = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Toursmodel, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const alltour = await features.query;
  res.status(201).json({
    status: 'success',
    numberofdata: alltour.length,
    data: alltour
  });

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tours: tours
  //   }
  // });
});

exports.getwithid = catchAsync(async (req, res, next) => {
  const tour = await Toursmodel.findById(req.params.id);
  if (!tour) {
    return next(new ErrorClass('there is no value with this id', 404));
  }
  res.status(201).json({
    status: 'success',
    data: tour
  });

  // const wantedid = req.params.id * 1;
  // const tour = tours.find(el => el.id === wantedid);
  // if (!tour) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'can not find the id '
  //   });
  // }
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
});

exports.createtour = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newtour = await Toursmodel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newtour
    }
  });
});

// const newid = tours[tours.length - 1].id + 1;
// const newtour = Object.assign({ id: newid }, req.body);
// tours.push(newtour);
// fs.writeFile('./dev-data/data/tours-simple.json', JSON.stringify(tours), err => {
//   if (err) console.log(err.message);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newtour
//     }
//   });

exports.updatetour = catchAsync(async (req, res, next) => {
  const tour = await Toursmodel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new ErrorClass('there is no value with this id', 404));
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
});

// if (req.params.id * 1 > tours.length) {
//   res.status(404).json({
//     status: 'fail',
//     message: 'can not find the id '
//   });
// }
// res.status(200).json({
//   status: 'success',
//   data: { tour: '<item is updated ....>' }
// });

exports.deletetour = catchAsync(async (req, res, next) => {
  const tour = await Toursmodel.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new ErrorClass('there is no value with this id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });

  // if (req.params.id * 1 > tours.length) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: 'can not find the id '
  //   });
  // }
  // res.status(204).json({
  //   status: 'success',
  //   data: null
  // });
});
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
