const express = require("express");
const getUserWalletController = require("../controllers/wallet-controller");

const walletroutes = express.Router();

walletroutes.get('/', getUserWalletController.getWalletByUserEmail);

walletroutes.patch('/:pid', getUserWalletController.updateUserWallet);

module.exports = walletroutes;