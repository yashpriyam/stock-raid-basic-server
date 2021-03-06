const UserStockData = require('../db-models/userStocks-models');

const userAllStocks = async (req,res,next) => {
    // const userEmail = req.params.pid
    const SSE_RES_HEADERS = {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-control': 'no-cache',
    }
    let stocks;
    res.writeHead(200, SSE_RES_HEADERS);
    setInterval(async () => {
        try {
            // stocks = await UserStockData.find({ email: userEmail });
            stocks = await UserStockData.find({}, '-id');
        } catch (error) {
            return res.status(400).json({message: 'fetching stocks failed, please try again'})
            // const err = new Error('fetching stocks failed', 500);
            // return next(err);
        }
        res.write(`data: ${JSON.stringify({userStocks: stocks.map(stock => stock.toObject({ getters: true }))})}\n\n`);
    }, 2000)
    
};

const newStockPurchase = async (req, res, next) => {
    const {
        email,
        stockName,
        numberOfStocks,
        totalCostOfPurchase,
    } = req.body;

    let userHasSameStocks;

    try {
        userHasSameStocks = await UserStockData.findOne({ email: email, stockName: stockName })
    } catch (error) {
        return res.status(400).json({message: 'Cannot access user\'s stock list, please try again'})
        // throw new Error('Cannot access user\'s stock list', 500);
    }
    if (userHasSameStocks) {
        userHasSameStocks.numberOfStocks += Number(numberOfStocks);
        userHasSameStocks.totalCostOfPurchase += Number(totalCostOfPurchase);
        try{
          await userHasSameStocks.save();
        } catch (err) {
            return res.status(400).json({message: 'Cannot access user\'s stock list, please try again'})
        // const error = new Error('error',500);
        // return next(error);
        }
        // userAllStocks();
        res.status(200).json({user: userHasSameStocks.toObject({getters: true})})
    } else {
        const newUserStockData = new UserStockData({
            email,
            stockName,
            numberOfStocks,
            totalCostOfPurchase,
        });
        try {
            await newUserStockData.save();
        } catch (error) {
            return res.status(400).json({message: 'Error occurred in saving purchase, please try again'})
            // return next(error);
        }
        // userAllStocks();
        res.status(201).json({user: newUserStockData.toObject({ getters: true })});
    }
};

const userStocksSell = async (req, res, next) => {
    const { numberOfStocks } = req.body;

    const stockId = req.params.pid;
    console.log(numberOfStocks);
    let stockToUpdate;

    try {
        stockToUpdate = await UserStockData.findById(stockId);
    } catch (error) {
        return res.status(400).json({message: 'Cannot access user\'s stock list, please try again'})
        // throw new Error('Cannot access user\'s stock list', 500);
    }
    // console.log(stockToUpdate);
    stockToUpdate.numberOfStocks = numberOfStocks
    try{
        await stockToUpdate.save();
    } catch (err) {
        return res.status(400).json({message: 'Cannot access user\'s stock list, please try again'})
    // const error = new Error('Cannot update',500);
    //     return next(error);
    }
    
    res.status(200).json({user: stockToUpdate.toObject({getters: true})})
};

exports.newStockPurchase = newStockPurchase;
exports.userAllStocks = userAllStocks;
exports.userStocksSell = userStocksSell;
