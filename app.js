const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { userRoutes, stockRoutes, walletRoutes, userStocksRoutes } = require('./routes');

const app = express();

app.use(bodyParser.json());

//Handling CORS errors, try to publish both the server and client on the same url
app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
})

app.use('/api/stocks', stockRoutes)
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/userstocks', userStocksRoutes);

app.use((req,res,next) => {
    const error = new Error("Could not find this route", 404)
    throw error;
})

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'});
});

const uri = "mongodb+srv://yash_priyam_stock_raid:vprnruotzHHyjaE5@cluster0.k468m.mongodb.net/stockRaidDB?retryWrites=true&w=majority";
mongoose
.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
.then(() => {
    app.listen(process.env.PORT || 5001, () => console.log(`Server is listening at 5001`));
})
.catch(err => {
    console.log(err);
})

// pwd: vprnruotzHHyjaE5
// usr: yash_priyam_stock_raid
// dbname: stockRaidDB