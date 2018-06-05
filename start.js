require('./models/Registration');
require('./models/Audio');
require('./models/User');
require('./models/Content_session');
const app = require('./app').app;

// connect mongo from .env file
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {});
mongoose.Promise = global.Promise;
mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open on ${process.env.DATABASE}`);
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

// start point
const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});