const mongoose = require('mongoose');

const userWalletSchema = mongoose.model('users-wallet',{
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    walletBalance: { type: Number, min: 0 },
    lastBalances: [{
        unixTime: { type: Number },
        balance: {type: Number}
    }]
});

module.exports = userWalletSchema;