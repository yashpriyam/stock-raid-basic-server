const mongoose = require('mongoose');

const userSchema = mongoose.model('stock-brokers',{
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    walletBalance: { type: Number, min: 0 }
});

module.exports = userSchema;