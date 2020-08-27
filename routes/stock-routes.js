const express = require("express");
const getStockController = require("../controllers/stock-controller");

const stockroutes = express.Router();

stockroutes.get('/', getStockController.getStocks);

stockroutes.post('/', getStockController.createStocks);

stockroutes.patch('/:pid', getStockController.updateStockPrice);

module.exports = stockroutes;