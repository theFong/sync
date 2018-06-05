const mongoose = require('mongoose');
Schema = mongoose.Schema;
require('./Content_session')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  content_sessions: [{
    type: Schema.ObjectId, ref: 'Content_session'
  }],
  pass_hash: {
    type: String,
    trim: true,
  }
});

module.exports = mongoose.model('User', userSchema);