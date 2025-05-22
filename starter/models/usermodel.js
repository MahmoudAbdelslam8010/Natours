const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'please enter a name'],
    maxlength: [40, 'max length for the name is 40'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'lead-guide', 'guide', 'user'],
    default: 'user'
  },
  email: {
    type: String,
    require: [true, 'please enter an email'],
    unique: [true, 'please enter an uniqe and correct email'],
    validate: [validator.isEmail, 'Please enter a valid name'],
    lowercase: true
  },
  password: {
    type: String,
    minlength: 8,
    require: [true, 'please enter a password '],
    select: false
  },
  passwordConfirm: {
    type: String,
    minlength: 8,
    require: [true, 'please enter a confirm password'],
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'please enter the same password'
    }
  },
  encryptedResetPasswordToken: {
    type: String
  },
  expiredTimeToken: {
    type: Date
  },
  photo: {
    type: String,
    default:'default.jpg'
  },
  passwordChangedAt: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

///////////////////////////////////////////////////////////////////////////
userSchema.methods.generateresettoken = function() {
  const resetpasswordtoken = crypto.randomBytes(32).toString('hex');
  this.encryptedResetPasswordToken = crypto
    .createHash('sha256')
    .update(resetpasswordtoken)
    .digest('hex');
  // make the token expird in 10 min
  this.expiredTimeToken = Date.now() + 10 * 60 * 1000;
  console.log(resetpasswordtoken, this.encryptedResetPasswordToken);
  return resetpasswordtoken;
};
//////////////////////////////////////////////////////////////////////////

userSchema.methods.passwordValidation = async function(enteredPassword, realPassword) {
  return await bcrypt.compare(enteredPassword, realPassword);
};

///////////////////////////////////////////////////////////////////////////////////
userSchema.methods.checkPasswordChange = function(jwtTimestamp) {
  if (!jwtTimestamp) return false; // Prevent errors if iat is missing

  if (this.passwordChangedAt) {
    const passwordChanged = Math.floor(this.passwordChangedAt.getTime() / 1000); // Convert to seconds
    console.log(jwtTimestamp, passwordChanged);
    return jwtTimestamp < passwordChanged; // If JWT issued before password change, reject it
  }

  return false; // If no password change, token is still valid
};
///////////////////////////////////////////////////////////////////////////////

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
////////////////////////////////////////////////////////
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
/////////////////////////////////////////////////////////////////////
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
