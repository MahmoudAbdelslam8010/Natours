const catchAsync = require('./../utils/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const ErrorClass = require('./../utils/ErrorClass');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ErrorClass('there is no document with this id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.getalldata = Model =>
  catchAsync(async (req, res) => {
    const features = new ApiFeatures(Model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const alldata = await features.query;
    res.status(201).json({
      status: 'success',
      numberofdata: alldata.length,
      data: alldata
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new ErrorClass('there is no Document with this id', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        doc: doc
      }
    });
  });
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newOne = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newOne
      }
    });
  });
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) {
      return next(new ErrorClass('there is no value with this id', 404));
    }
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });
