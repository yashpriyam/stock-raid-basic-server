const mongoose = require('mongoose');

const userStockSchema = mongoose.model('user-stocks',{
    email: { type: String, required: true },
    stockName: { type: String, required: true },
    numberOfStocks: { type: Number, required: true, min: 0 },
    totalCostOfPurchase: { type: Number, required: true, min: 0 },
});

module.exports = userStockSchema;