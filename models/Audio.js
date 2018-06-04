const mongoose = require('mongoose');

const audioSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  artist: {
    type: String,
    trim: true,
  },
  audio_link: {
    type: String,
    trim: true,
  },
  cover_art_link: {
    type: String,
    trim: true,
  }
});

module.exports = mongoose.model('Audio', audioSchema);