const express = require('express');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const ErrorClass = require('./utils/ErrorClass');

const app = express();
const ErrorController = require('./controller/errorController');
const toursroute = require('./routers/toursroutes');
const usersroute = require('./routers/usersroutes');
const reviewssroute = require('./routers/reviewroutes');
const viewsroutes = require('./routers/viewsroutes');

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
// for santize melicuios code in the query of mongo
app.use(mongoSanitize());
// santize injection of html code in any field of database
app.use(xss());
app.use('/', viewsroutes);
app.use('/api/v1/tours', toursroute);
app.use('/api/v1/users', usersroute);
app.use('/api/v1/reviews', reviewssroute);

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
