const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const tourmodel = require('./../../models/tourmodel');
const usermodel = require('./../../models/usermodel');
const reviewmodel = require('./../../models/reviewmodel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace(
  '<DATABASE_NAME>',
  process.env.NAME
);
mongoose.connect(DB).then(() => console.log('DB connection successful!'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
const importdata = async () => {
  try {
    await usermodel.create(users, { validateBeforeSave: false });
    await tourmodel.create(tours);
    await reviewmodel.create(reviews, { validateBeforeSave: false });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deletedata = async () => {
  try {
    await tourmodel.deleteMany();
    await usermodel.deleteMany();
    await reviewmodel.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importdata();
} else if (process.argv[2] === '--delete') {
  deletedata();
}
console.log(process.argv);
