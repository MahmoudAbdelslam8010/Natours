const mongoose = require('mongoose');
const slugify = require('slugify');

const validator = require('validator');

const Tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'name should be less than or equal than  40 char '],
      minlength: [5, 'name should be more than or equal than 20 char']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messsage: 'should be easy , medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validator: function(val) {
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretField: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      adress: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
Tourschema.virtual('durationinweek').get(function() {
  return this.duration / 7;
});
Tourschema.virtual('Reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
Tourschema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
Tourschema.pre(/^find/, function(next) {
  this.find({ secretField: { $ne: true } });

  this.start = Date.now();
  next();
});
Tourschema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});
// Tourschema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretField: { $ne: true } } });
//   next();
// });
Tourschema.index({ price: 1, ratingsAverage: 1 });
Tourschema.index({ slug: 1 });
Tourschema.index({ startLocation: '2dsphere' });
const Tourmodel = mongoose.model('Tour', Tourschema);
module.exports = Tourmodel;
// const tourdocument = new Tourmodel({
//   name: 'koka',
//   price: 55
// });
// tourdocument
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('ERRRRRRRRRR', err);
//   });
