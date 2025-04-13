const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
process.on('uncaughtException', err => {
  console.log('im in uncaughtException ');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD).replace(
  '<DATABASE_NAME>',
  process.env.NAME
);
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`APP is listen to req from port ${port}`);
});
process.on('unhandledRejection', err => {
  console.log('im in unhandledRejection ');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
