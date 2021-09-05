const mongoose = require('mongoose');

const schema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    email: String,
    password: String,
    username: String,
    data: Object,
    onMailingList: Boolean
});

module.exports = mongoose.model('User', schema);