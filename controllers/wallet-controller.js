const UserWallet = require('../db-models/wallet-models');

const getWalletByUserEmail = async (req, res, next) => {
  // const userEmail = req.params.pid;  
  const SSE_RES_HEADERS = {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-control': 'no-cache'
  }

  let wallet;
  res.writeHead(200, SSE_RES_HEADERS);
  setInterval(async () => {
    try {
      wallet = await UserWallet.find({}, '-id')
    } catch(err) {
      return res.status(400).json({message: 'Cannot get user wallet, please try again'})
      const error = new Error('Cannot get user\'s wallet', 500);
      return next(error);
    }
    if (!wallet) {
      return res.status(400).json({message: 'User wallet not accessible, please try again'})
      // const error = new Error('The user does not exists', 404);
      // return next(error)
    } 
    res.write(`data: ${JSON.stringify({wallet: wallet.map(eachWallet => eachWallet.toObject({ getters: true}))})}\n\n`);
  }, 5000);
};


const updateUserWallet = async (req,res,next) => {
  const { walletBalance } = req.body;
  const userEmail = req.params.pid;
  
  if (walletBalance <= 0) {
    return res.status(400).json({message: 'Not enough balance to make this transaction, please try again with increased wallet balance'})
    // const error = new Error('Not enough balance to make this transaction',500);
    // return next(error);
  }
  let userWallet;
  try {
    userWallet = await UserWallet.findOne({ email: userEmail });
  } catch (err) {
    return res.status(400).json({message: 'Cannot get to your wallet, please try again'})
    // const error = new Error('Cannot get to your wallet', 500);
    // return next(error);
  }

  userWallet.lastBalances.push({
    unixTime: Math.floor(new Date() / 1000),
    balance: userWallet.walletBalance
  })
  userWallet.walletBalance = Number(walletBalance).toFixed(2);

  try{
    await userWallet.save();
  } catch (err) {
    return res.status(400).json({message: 'Cannot use your wallet, please try again'})
    // const error = new Error('Cannot use your wallet',500);
    // return next(error);
  }
  // getWalletByUserEmail(userWallet.email);
  res.status(200).json({userWallet: userWallet.toObject({getters: true})})
};

exports.getWalletByUserEmail = getWalletByUserEmail;
exports.updateUserWallet = updateUserWallet;