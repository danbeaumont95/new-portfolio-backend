const mongoose = require('mongoose');
const User = require('./User');

const schema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    userId: {
        type: mongoose.Types.ObjectId,
        ref: User
    },
    sessionToken: String
});

module.exports = mongoose.model('Session', schema);