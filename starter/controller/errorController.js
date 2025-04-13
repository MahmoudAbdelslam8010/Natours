const ErrorClass = require('./../utils/ErrorClass');

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorClass(message, 400);
};
const handleValidiationErorr = err => {
  console.log(Object.values(err.errors));
  const messageArray = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  const message = `Please enter correct value in fields ${messageArray}`;
  return new ErrorClass(message, 400);
};
const handleJsonWebTokenError = () => {
  return new ErrorClass('Invalid token. Please log in again!', 401);
};
const handleTokenExpiredError = () => {
  return new ErrorClass('token time expired', 401);
};
const handeduplicateError = err => {
  const nameExtract = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `name ${nameExtract} is already exist , try another name `;
  return new ErrorClass(message, 400);
};
const devError = (res, err) => {
  console.log('im in  dev error');
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const prodError = (res, err) => {
  console.log('im in  prod error');
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('ERROR', err);
    res.status(500).json({
      status: err.status,
      message: 'something went wrong'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'devolopment') {
    devError(res, err);
  } else {
    let error = err;
    if (err.name === `CastError`) {
      console.log(' im in casterror');
      error = handleCastError(err);
      prodError(res, error);
    } else if (err.code === 11000) {
      console.log('im in code err');
      error = handeduplicateError(err);
      prodError(res, error);
    } else if (err.name === 'ValidationError') {
      console.log('im in validiation error');
      error = handleValidiationErorr(error);
      prodError(res, error);
    } else if (err.name === 'JsonWebTokenError') {
      console.log('im JsonWebTokenError');
      error = handleJsonWebTokenError(error);
      prodError(res, error);
    } else if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
      prodError(res, error);
    } else {
      prodError(res, err);
    }
  }
};
