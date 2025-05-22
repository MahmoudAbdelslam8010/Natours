const UserModel = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer')
const sharp = require('sharp')
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
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null,'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const storage = multer.memoryStorage()
const filter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
  cb(null, true)
  } else {cb(new ErrorClass('Not an image! Please upload only images.', 400), false)
}}
const upload = multer({
  storage: storage,
  fileFilter:filter
})
exports.updatePhoto = upload.single('photo')

exports.rezisePhoto =async (req, res, next) => {
  if (!req.file) return next();
  console.log(req.file)
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)
  next();
}
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
  if(req.file) filteredObj.photo = req.file.filename
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
