const mongoose = require('mongoose')
const bookingSchema  = new mongoose.Schema({
    tour: {
        type:mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true,'booking should have a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require:[true,"booking should have a user"]
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})
bookingSchema.pre('/^find/', function (next) {
    this.populate('user').populate({
        path: 'tour',
        select:'name'
    })
    next()
}
)
const bookingModel = mongoose.model('booking', bookingSchema)
module.exports = bookingModel

