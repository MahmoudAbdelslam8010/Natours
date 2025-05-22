const Tourmodel = require("../models/tourmodel");
const BookingModel = require("../models/bookingmodel")
const catchAsync = require("../utils/catchAsync");
const bookingModel = require("../models/bookingmodel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
exports.getCheckOut = catchAsync(async (req, res, next) => {
    const tour = await Tourmodel.findById(req.params.tourId)
    const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
        {
        price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            },
        },
        quantity: 1,
        }
    ]
    });

        res.status(200).json({
            status: 'success',
            session:session
        })
})
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query
    if (!tour && !user && !price) { return next(); }
    await bookingModel.create({ tour, user, price })
    res.redirect(req.originalUrl.split('?')[0])
})
