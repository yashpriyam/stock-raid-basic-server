const express = require("express");
const getUserStocksController = require("../controllers/userStocks-controller");

const userStockRoutes = express.Router();

userStockRoutes.get('/', getUserStocksController.userAllStocks);

userStockRoutes.post('/', getUserStocksController.newStockPurchase);

userStockRoutes.patch('/:pid', getUserStocksController.userStocksSell);

module.exports = userStockRoutes;