const UserWallet = require('../db-models/wallet-models');

const getWalletByUserEmail = async (req, res, next) => {
  const userEmail = req.params.pid;

  const SSE_RES_HEADERS = {
    'Connection': 'keep-alive',
    'Content-type': 'text/event-stream',
    'Cache-control': 'no-cache',
  }

  let wallet;

  res.writeHead(200, SSE_RES_HEADERS);

  setInterval( async () => {
    try {
      wallet = await UserWallet.findOne({ email: userEmail })
    } catch(err) {
      const error = new Error('Cannot get user\'s wallet', 500);
      return next(error);
    }
    if (!wallet) {
      const error = new Error('The user does not exists', 404);
      return next(error)
    } 
    res.write(`data: ${JSON.stringify({wallet: wallet.toObject({ getters: true})})}\n\n`);
  }, 1000)
  // res.json({ wallet: wallet.toObject({ getters: true}) });
};


const updateUserWallet = async (req,res,next) => {
  const { walletBalance } = req.body;
  const userEmail = req.params.pid;
  // console.log(walletBalance, userEmail);
  if (walletBalance <= 0) {
    const error = new Error('Not enough balance to make this transaction',500);
    return next(error);
  }
  let userWallet;
  try {
    userWallet = await UserWallet.findOne({ email: userEmail });
  } catch (err) {
    const error = new Error('Cannot get to your wallet', 500);
    return next(error);
  }

  userWallet.walletBalance = walletBalance.toFixed(2);

  try{
    await userWallet.save();
  } catch (err) {
    const error = new Error('Cannot use your wallet',500);
    return next(error);
  }
  res.status(200).json({userWallet: userWallet.toObject({getters: true})})
};

exports.getWalletByUserEmail = getWalletByUserEmail;
exports.updateUserWallet = updateUserWallet;
