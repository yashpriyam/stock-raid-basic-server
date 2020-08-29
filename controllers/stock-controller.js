const Stocks = require('../db-models/stocks-models');

const getStocks = async (req,res,next) => {
    const SSE_RES_HEADERS = {
        'Connection': 'keep-alive',
        'Content-type': 'text/event-stream',
        'Cache-control': 'no-cache',
    }
    let stocks;
    res.writeHead(200, SSE_RES_HEADERS);
    setInterval(async () => {
        try {
            stocks = await Stocks.find({}, '-id');
        } catch (error) {
            const err = new Error('fetching stocks failed', 500);
            return next(err);
        }
        res.write(`data: ${JSON.stringify({stocks: stocks.map(stock => stock.toObject({ getters: true }))})}\n\n`);
    }, 500);
};

const createStocks = async (req, res, next) => {
    const { stockname, stocksymbol, availablestocks, pershareprice } = req.body;    
    let existingStocks;
    try {
        existingStocks = await Stocks.findOne({ stockname: stockname })
    } catch (error) {
        throw new Error('Error occurred in creating stock, try again later', 500);
    }

    if (existingStocks) {
        const error = new Error('Stock already listed', 422)
        return next(error);
    }
    const newStock = new Stocks({
        stockname,
        stocksymbol,
        totalstocks: 1000000,
        availablestocks,
        pershareprice: pershareprice.toFixed(2),
    });

    try {
        await newStock.save();
    } catch (error) {
        return next(error);
    }
    res.status(201).json({stock: newStock.toObject({ getters: true })});
};

const updateStockPrice = async (req,res,next) => {
    const { pershareprice, availablestocks } = req.body;
    const stockId = req.params.pid;
    // console.log(`pershareprice ${pershareprice}`);
    
    let stock;
    try {
        stock = await Stocks.findById(stockId);
    } catch (err) {
      const error = new Error('error', 500);
      return next(error);
    }
  
    stock.pershareprice = pershareprice;
    stock.availablestocks = availablestocks;
  
    try{
      await stock.save();
    } catch (err) {
      const error = new Error('error in updating',500);
      return next(error);
    }
    res.status(200).json({stock: stock.toObject({getters: true})})
  };

exports.getStocks = getStocks;
exports.createStocks = createStocks;
exports.updateStockPrice = updateStockPrice;