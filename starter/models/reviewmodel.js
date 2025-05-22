const mongoose = require('mongoose');
const tourmodel = require('./tourmodel');

const reviewSchema = new mongoose.Schema(
  {
    wroteBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    review: {
      type: String,
      require: [true, 'please enter your review to submit']
    },
    rating: {
      type: Number,
      require: [true, 'please enter your rating to submit'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'wroteBy',
    select: 'name photo'
  });
  next();
});
reviewSchema.statics.calcRatingAverageAndNoRating = async function(tourid) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourid }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);
  if (stats > 0) {
    await tourmodel.findByIdAndUpdate(tourid, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await tourmodel.findByIdAndUpdate(tourid, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcRatingAverageAndNoRating(this.tour);
});
reviewSchema.post(/^findOneAnd/, async function(doc) {
  await doc.constructor.calcRatingAverageAndNoRating(doc.tour);
});
const reviewModel = mongoose.model('Review', reviewSchema);
module.exports = reviewModel;
