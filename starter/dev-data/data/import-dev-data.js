const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

const tourmodel = require('./../../models/tourmodel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace(
  '<DATABASE_NAME>',
  process.env.NAME
);
mongoose.connect(DB).then(() => console.log('DB connection successful!'));
const data = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const importdata = async () => {
  try {
    await tourmodel.create(data);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deletedata = async () => {
  try {
    await tourmodel.deleteMany();
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
