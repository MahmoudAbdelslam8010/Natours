const UserModel = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');

const ErrorClass = require('../utils/ErrorClass');
const handlerFactory = require('./handlerFactory');

const ObjFilter = (reqBodyObj, ...WantedData) => {
  const newObj = {};
  Object.keys(reqBodyObj).forEach(el => {
    if (WantedData.includes(el)) {
      newObj[el] = reqBodyObj[el];
    }
  });
  return newObj;
};

exports.createuser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'to create user go  to signup'
  });
};
exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});
exports.getuserbyid = handlerFactory.getOne(UserModel);
exports.getallusers = handlerFactory.getalldata(UserModel);
exports.updateuser = handlerFactory.updateOne(UserModel);
exports.deleteuser = handlerFactory.deleteOne(UserModel);

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new ErrorClass('please go update password , update me is not valid for update the password', 400));
  }
  const filteredObj = ObjFilter(req.body, 'name', 'email');
  const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
