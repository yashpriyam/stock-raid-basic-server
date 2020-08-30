const mongoose = require('mongoose');

const stockSchema = mongoose.model('stocks-data',{
    stockname: { type: String, required: true, unique: true },
    stocksymbol: { type: String, required: true, unique: true },
    totalstocks: { type: Number, required: true, min: 0 },
    availablestocks: { type: Number, required: true, min: 0 },
    pershareprice: { type: Number, required: true, min: 0 },
    lastPrices: [{
        unixTime: { type: Date },
        price: {type: Number}
    }]
});

module.exports = stockSchema;