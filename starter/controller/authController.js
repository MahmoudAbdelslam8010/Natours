const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const ErrorClass = require('./../utils/ErrorClass');
const UserModel = require('../models/usermodel');
const Email = require('../utils/email')
const signToken = id => {
  return jwt.sign({ id }, process.env.secretJwtKey, {
    expiresIn: process.env.tokenExpiredTime
  });
};
const createAndSendToken = (statusCode, user, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  const cookiesOption = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.cookieExpiredTime * 24 * 60 * 60 * 1000)
  };
  if (process.env.NODE_ENV === 'production') cookiesOption.secure = true;
  res.cookie('jwt', token, cookiesOption);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get('host')}/login`;
  await new Email(newUser,url).sendWelcome()
  createAndSendToken(201, newUser, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //if user dont fill fields
  if (!email || !password) return next(new ErrorClass('please enter email and password in each field', 400));
  //if email and password correct
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await user.passwordValidation(password, user.password))) {
    return next(new ErrorClass('email or password is not correct', 401));
  }
  createAndSendToken(200, user, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    httpOnly: true,
    expires:new Date(Date.now() + 10*1000)
  })
  res.status(200).json({
    status:'success'
  })
}
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //  check if there is header or not
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new ErrorClass('You can not login ', 401));
  }
  // verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.secretJwtKey);
  console.log(decoded);

  // make sure that acc is still  exist
  const freshuser = await UserModel.findById(decoded.id);
  if (!freshuser) {
    return next(new ErrorClass('this user is not exist ', 401));
  }

  //check if the password is not changed
  if (freshuser.checkPasswordChange(decoded.iat)) {
    return next(new ErrorClass('the password is changed ', 401));
  }

  // this line will be useful in the future
  req.user = freshuser;
  res.locals.user = freshuser
  next();
});



exports.isloggedin = async (req, res, next) => {
  try {

    if (req.cookies.jwt) {

      // verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.secretJwtKey);
      console.log(decoded);

      // make sure that acc is still  exist
      const freshuser = await UserModel.findById(decoded.id);
      if (!freshuser) {
        return next();
      }

      //check if the password is not changed
      if (freshuser.checkPasswordChange(decoded.iat)) {
        return next();
      }

      // this line will be useful in the future
      res.locals.user=freshuser
      return next();
    }
  } catch (error) {
      return next()
  }
  next()
};

exports.restrictTo = (...role) => {
  console.log(role);
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(new ErrorClass('you are not allowed to enter this page', 403));
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // check is the email is exist or not
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorClass('there is no email like that ', 404));
  }
  // generate reset token
  const resetpasswordtoken = user.generateresettoken();
  await user.save({ validateBeforeSave: false });

  // send the token via the email
  // eslint-disable-next-line camelcase
  const Token_Messsage = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetpasswordtoken}`;
  // eslint-disable-next-line camelcase

  try {
    await new Email(user,Token_Messsage).resetPassword()
    res.status(200).json({
      status: 'success',
      message: 'the mail is sent to email'
    });
  } catch (err) {
    console.log(err);
    user.encryptedResetPasswordToken = undefined;
    user.expiredTimeToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorClass('there is a problem in a sending an email , please try again later  ', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({
    encryptedResetPasswordToken: hashedtoken,
    expiredTimeToken: { $gt: Date.now() }
  });
  if (!user) {
    return next(new ErrorClass('the token has been expired or is invalid', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.encryptedResetPasswordToken = undefined;
  user.expiredTimeToken = undefined;
  await user.save();
  createAndSendToken(200, user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from the collection
  const user = await UserModel.findById(req.user.id).select('+password');
  // check if the password is correct
  if (!(await user.passwordValidation(req.body.passwordCurrent, user.password))) {
    return next(new ErrorClass('please enter valid password', 401));
  }
  //update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createAndSendToken(200, user, res);
});

exports.getMeData = (req, res) => {
  res.status(200).render('accountMe', {
    title:'Your account'
  })
}
