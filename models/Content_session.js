const mongoose = require('mongoose');
Schema = mongoose.Schema;
require('./User')
require('./Audio')

const content_sessionSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    current_time: {
        type: Number, min: 0, default: 0
    },
    users: [{
        type: Schema.ObjectId, ref: 'User'
    }],
    audio: {
        type: Schema.ObjectId, ref: 'Audio'
    }
});

module.exports = mongoose.model('Content_session', content_sessionSchema);