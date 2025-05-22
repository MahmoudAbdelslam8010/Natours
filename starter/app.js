const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const compression = require('compression')
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser')
const ErrorClass = require('./utils/ErrorClass');

const app = express();
const ErrorController = require('./controller/errorController');
const toursroute = require('./routers/toursroutes');
const usersroute = require('./routers/usersroutes');
const reviewssroute = require('./routers/reviewroutes');
const viewsroutes = require('./routers/viewsroutes');
const bookingroutes = require('./routers/bookingroutes');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(helmet());


const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 60 minutes).
  message: 'Too Many Request , Please Try Again later in 1hr '
});
app.use('/api', rateLimiter);
if (process.env.NODE_ENV === 'devolopment') app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())
// for santize melicuios code in the query of mongo
app.use(mongoSanitize());
// santize injection of html code in any field of database
app.use(xss());
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});
app.use(compression())
app.use((req, res, next) => {
  console.log(req.cookies)
  next();
})
app.use('/', viewsroutes);
app.use('/', viewsroutes);
app.use('/api/v1/tours', toursroute);
app.use('/api/v1/users', usersroute);
app.use('/api/v1/reviews', reviewssroute);
app.use('/api/v1/bookings', bookingroutes);
app.all('*', (req, res, next) => {
  next(new ErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(ErrorController);

module.exports = app;
/*
app.get('/api/v1/tours', getalldata);
app.get('/api/v1/tours/:id', getwithid);
app.post('/api/v1/tours', createtour);
app.patch('/api/v1/tours/:id', updatetour);
app.delete('/api/v1/tours/:id', deletetour);
*/
